import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Film, Star, Clock, Calendar } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const MovieDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const userId = 'ur14323971';

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const listsResponse = await fetch(`/api/lists/${userId}`);
      const lists = await listsResponse.json();
      
      const allMovies = [];
      for (const listUrl of lists) {
        const listId = listUrl.split('/').filter(Boolean).pop();
        const moviesResponse = await fetch(`/api/list/${listId}`);
        const movies = await moviesResponse.json();
        allMovies.push(...movies);
      }
      
      setMovies(allMovies);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to fetch movies. Please try again later.');
    }
    setLoading(false);
  };

  // Calculate statistics
  const totalMovies = movies.length;
  const averageRating = movies.reduce((acc, movie) => acc + (parseFloat(movie.rating) || 0), 0) / totalMovies || 0;

  // Genre distribution
  const genreData = Object.entries(
    movies.reduce((acc, movie) => {
      const genres = movie.genre.split(', ');
      genres.forEach(genre => {
        acc[genre] = (acc[genre] || 0) + 1;
      });
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Rating distribution
  const ratingData = Object.entries(
    movies.reduce((acc, movie) => {
      if (movie.rating !== 'N/A') {
        acc[movie.rating] = (acc[movie.rating] || 0) + 1;
      }
      return acc;
    }, {})
  ).map(([rating, count]) => ({ rating, count }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading your movies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <Film className="h-8 w-8 text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Movies Watched</p>
              <p className="text-2xl font-bold">{totalMovies}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Star className="h-8 w-8 text-yellow-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Clock className="h-8 w-8 text-green-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Movies/Week</p>
              <p className="text-2xl font-bold">{(totalMovies / 52).toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Calendar className="h-8 w-8 text-purple-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Movies/Month</p>
              <p className="text-2xl font-bold">{(totalMovies / 12).toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Genre Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingData}>
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Movie List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Title</th>
                    <th className="text-left p-2">Year</th>
                    <th className="text-left p-2">Rating</th>
                    <th className="text-left p-2">Genre</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-2">{movie.title}</td>
                      <td className="p-2">{movie.year}</td>
                      <td className="p-2">{movie.rating}</td>
                      <td className="p-2">{movie.genre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MovieDashboard;