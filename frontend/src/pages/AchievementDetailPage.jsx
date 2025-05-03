import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const AchievementDetailPage = () => {
  const { id } = useParams(); // Ensure `id` is extracted from the URL
  const [achievement, setAchievement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid achievement ID.');
      setLoading(false);
      return;
    }

    const fetchAchievement = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/api/achievements/${id}`);
        setAchievement(response.data);
      } catch (err) {
        setError('Failed to load achievement details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievement();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">{achievement.title}</h1>
      <p className="text-gray-700">{achievement.description}</p>
      {achievement.imageUrl && (
        <img
          src={`http://localhost:8081${achievement.imageUrl}`}
          alt={achievement.title}
          className="mt-4 rounded-lg"
        />
      )}
      {achievement.videoUrl && (
        <div className="mt-4">
          <iframe
            src={`https://www.youtube.com/embed/${achievement.videoUrl}`}
            className="w-full h-64 rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default AchievementDetailPage;
