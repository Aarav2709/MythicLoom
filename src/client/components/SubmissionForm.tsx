import { ChangeEvent, FormEvent, useMemo, useState } from 'react';

export type SubmissionFormProps = {
  prompt: string;
  minLength: number;
  maxLength: number;
  onSubmit: (payload: { branchText: string }) => Promise<void>;
};

const SubmissionForm = ({ prompt, minLength, maxLength, onSubmit }: SubmissionFormProps) => {
  const [branchText, setBranchText] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const remaining = useMemo(() => maxLength - branchText.length, [branchText.length, maxLength]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'saving') return;

    setStatus('saving');
    setErrorMessage('');

    try {
      await onSubmit({ branchText });
      setStatus('success');
      setBranchText('');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unable to submit branch.');
    }
  };

  return (
    <form className="submission" onSubmit={handleSubmit}>
      <div className="submission__frame">
        <header className="submission__header">
          <span className="submission__eyebrow">Forge a branch</span>
          <h2>Answer today&apos;s spark</h2>
          <p>{prompt}</p>
        </header>

        <div className="submission__primary">
          <label htmlFor="branchText">Narrative</label>
          <textarea
            id="branchText"
            value={branchText}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setBranchText(event.target.value)}
            minLength={minLength}
            maxLength={maxLength}
            rows={6}
            required
            placeholder="Write the next twist in the saga..."
          />
          <div className="submission__meter" role="status" aria-live="polite">
            <span>Remaining characters</span>
            <strong>{remaining}</strong>
          </div>
        </div>

        {status === 'success' && <p className="submission__success">Branch transmitted for voting!</p>}
        {errorMessage && <p className="submission__error">{errorMessage}</p>}
        <button type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Submitting…' : 'Launch branch'}
        </button>
      </div>
    </form>
  );
};

export default SubmissionForm;
