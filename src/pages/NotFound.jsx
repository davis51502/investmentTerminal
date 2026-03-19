import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section>
      <h1>404</h1>
      <p>We couldn't find that page.</p>
      <p>
        Go back <Link to="/">home</Link>.
      </p>
    </section>
  )
}

export default NotFound
