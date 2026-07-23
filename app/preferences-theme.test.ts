import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePreferenceState } from './preferences-theme';

test('normalizePreferenceState merges nested and top-level preference values', () => {
  const normalized = normalizePreferenceState({
    theme: 'dark',
    reduceMotion: true,
    preferences: {
      accentColor: '#ff00aa',
      shellStyle: 'midnight',
      compactMode: true,
    },
  });

  assert.equal(normalized.theme, 'dark');
  assert.equal(normalized.reduceMotion, true);
  assert.equal(normalized.preferences?.accentColor, '#ff00aa');
  assert.equal(normalized.preferences?.shellStyle, 'midnight');
  assert.equal(normalized.preferences?.compactMode, true);
});
