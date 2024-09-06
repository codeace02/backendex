import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {

  const [jokes, setJokes] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3010/api/jokes')
      .then((res) => {
        setJokes(res.data)
      })
      .catch((err) => {
        console.error('error', err)
      })
  },[])

  return (
    <>
      <h1>
        Front end web
      </h1>

      <p>
        JOKES : {jokes?.length}
      </p>

      {
        jokes?.map(joke => (
          <div key={joke?.id}>
            <h3>
              {joke?.title}
            </h3>
            <p>
              {joke?.content}
            </p>
          </div>
        ))
      }

    </>
  )
}

export default App
