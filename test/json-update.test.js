
test('Updates extension data correctly', () => {
  const latestData = {
    'test-id': {
      name: 'Test Extension',
      version: '1.0.0',
      users: '1,000,000+ users',
      rating: '4.5',
      timestamp: 1000
    }
  };

  const historyData = {
    'test-id': [
      {
        name: 'Test Extension',
        version: '1.0.0',
        users: '1,000,000+ users',
        rating: '4.5',
        timestamp: 1000
      }
    ]
  };

  const newData = {
    name: 'Test Extension',
    version: '2.0.0',
    users: '1,500,000+ users',
    rating: '4.7',
    timestamp: 2000
  };

  function updateData(extensionId, newInfo, latest, history) {
    latest[extensionId] = { ...newInfo };

    if (!history[extensionId]) {
      history[extensionId] = [];
    }
    history[extensionId].push({ ...newInfo });

    return { latest, history };
  }

  const { latest, history } = updateData('test-id', newData, latestData, historyData);

  expect(latest['test-id'].version).toBe('2.0.0');
  expect(latest['test-id'].users).toBe('1,500,000+ users');
  expect(latest['test-id'].rating).toBe('4.7');

  expect(history['test-id'].length).toBe(2);
  expect(history['test-id'][1].version).toBe('2.0.0');
});
