import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { topicsRoute } from './routes/topics';
import { episodesRoute } from './routes/episodes';

const app = new Hono()

app.use('*', logger());

app.get('/test', (c) => {
    return c.json({ 'message': 'Hello Hono!' })
})

app.route('/api/topics', topicsRoute);
app.route('/api/episodes', episodesRoute);

export default app