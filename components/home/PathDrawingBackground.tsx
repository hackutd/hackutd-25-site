import React from 'react';
import styles from './PathDrawingBackground.module.css';

interface PathDrawingBackgroundProps {
  children: React.ReactNode;
}

const PathDrawingBackground: React.FC<PathDrawingBackgroundProps> = ({ children }) => {
  return (
    <div className={styles.backgroundContainer}>
      <div className={styles.overlay} />

      <div className={styles.contentContainer}>{children}</div>
    </div>
  );
};

export default PathDrawingBackground;
