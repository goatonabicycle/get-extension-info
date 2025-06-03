/**
 * Test for JSON data manipulation
 */

test('Updates extension data correctly', () => {
  // Sample data structures
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
  
  // New extension data to update
  const newData = {
    name: 'Test Extension',
    version: '2.0.0',
    users: '1,500,000+ users',
    rating: '4.7',
    timestamp: 2000
  };
  
  // Function to test updating data (similar to what might be in index.js)
  function updateData(extensionId, newInfo, latest, history) {
    // Update latest data
    latest[extensionId] = { ...newInfo };
    
    // Update history data
    if (!history[extensionId]) {
      history[extensionId] = [];
    }
    history[extensionId].push({ ...newInfo });
    
    return { latest, history };
  }
  
  // Perform the update
  const { latest, history } = updateData('test-id', newData, latestData, historyData);
  
  // Verify the updates
  expect(latest['test-id'].version).toBe('2.0.0');
  expect(latest['test-id'].users).toBe('1,500,000+ users');
  expect(latest['test-id'].rating).toBe('4.7');
  
  // Verify history was updated
  expect(history['test-id'].length).toBe(2);
  expect(history['test-id'][1].version).toBe('2.0.0');
});
