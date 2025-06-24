    try {
      const response = await axios.get('/api/questions');
      const questionsData = response.data;
      const shuffled = shuffleArray([...questionsData]).slice(0, 10);
      setQuestions(questionsData);
      setShuffledQuestions(shuffled);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleOptionSelect = (option, factor) => {
    setSelectedOption({ option, factor });
  };

  const handleNext = () => {