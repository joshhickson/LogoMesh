import { IdeaManager } from '../IdeaManager';
import { logger } from '../utils/logger';

jest.mock('../utils/logger');

describe('IdeaManager', () => {
  let manager: IdeaManager;

  beforeEach(() => {
    manager = new IdeaManager();
  });

  test('should initialize with empty thoughts array', () => {
    expect(manager.getThoughts()).toEqual([]);
  });

  test('should load thoughts from storage on initialization', () => {
    // Implementation will be added in subsequent tasks
    expect(true).toBe(true);
  });
});
