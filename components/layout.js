import styles from '../styles/layout.module.css';
// import Head from 'next/head'
// import Link from 'next/link'
// import cn from 'classnames'
export default function Layout({ children }) {
  return <div className={styles.container}>{children}</div>;
}
