const assert = require('chai').assert;
const db = require('../db/db'); 

describe('Database Connection', () => {
  it('should connect to the database', async () => {
    try {
      await db.connect(); // try to connect to the database
      assert.isTrue(true); 
    } catch (error) {
      assert.fail('Error connecting to the database'); 
    } finally {
      db.end(); // Disconnect from the database after the test
    }
  });
});
