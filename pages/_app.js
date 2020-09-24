import '../styles/globals.css';
import Layout from '../components/layout';
import 'react-datepicker/dist/react-datepicker.css';

function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default App;
