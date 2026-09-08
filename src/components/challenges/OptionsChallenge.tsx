import React from 'react';
import { Challenge } from '../../types';
import { Answer } from '../../lib/checkAnswer';

interface Props {
  challenge: Challenge;
  answer: Answer;
  onAnswer: (answer: Answer) => void;
  checked: boolean;
  locked: boolean;
}

/** quiz, output_prediction (single choice) and multi_select (several). */
export const OptionsChallenge: React.FC<Props> = ({ challenge, answer, onAnswer, checked, locked }) => {
  const multi = challenge.type === 'multi_select';
  const selected: number[] = multi
    ? ((answer as number[]) ?? [])
    : typeof answer === 'number'
      ? [answer]
      : [];

  const correctSet = new Set(multi ? challenge.correctIndices ?? [] : [challenge.correctIndex ?? -1]);

  const toggle = (index: number) => {
    if (locked) return;
    if (!multi) {
      onAnswer(index);
      return;
    }
    const current = new Set(selected);
    if (current.has(index)) current.delete(index);
    else current.add(index);
    onAnswer([...current].sort((a, b) => a - b));
  };

  return (
    <div
      className="challenge-options"
      role={multi ? 'group' : 'radiogroup'}
      aria-label={multi ? 'Select every correct answer' : 'Select one answer'}
    >
      {multi && (
        <p className="challenge-hint-line">Select every answer that applies.</p>
      )}

      {(challenge.options ?? []).map((option, index) => {
        const isSelected = selected.includes(index);
        const isCorrect = correctSet.has(index);

        const classes = ['option-btn'];
        if (isSelected && !checked) classes.push('selected');
        if (checked) {
          if (isCorrect) classes.push('correct');
          else if (isSelected) classes.push('incorrect');
          else classes.push('muted');
        }

        return (
          <button
            key={index}
            type="button"
            className={classes.join(' ')}
            onClick={() => toggle(index)}
            disabled={locked}
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={isSelected}
          >
            <span className={`option-letter ${multi ? 'is-box' : ''}`.trim()}>
              {multi ? (isSelected ? '✓' : '') : String.fromCharCode(65 + index)}
            </span>
            <span className="option-text">{option}</span>
            {checked && isCorrect && <span className="option-flag">correct</span>}
          </button>
        );
      })}
    </div>
  );
};
