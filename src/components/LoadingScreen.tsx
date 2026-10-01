import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
  slow?: boolean;
}

export function LoadingScreen({ slow }: LoadingScreenProps) {
  return (
    <div className={styles.wrap}>
      <p className={styles.text} role="status">
        {slow ? 'Still checking your session — this is taking longer than usual.' : 'Loading…'}
      </p>
    </div>
  );
}
