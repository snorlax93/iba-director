import { Hono } from "hono";
import { z as validator, } from "zod";
import { zValidator } from "@hono/zod-validator";

export const topicSchema = validator.object({
    id: validator.number(),
    name: validator.string(),
    description: validator.string(),
    url: validator.string().optional(),
    score: validator.number().optional().default(0),
    submitter: validator.number(),
    main: validator.boolean().default(false),
    category: validator.string().default('uncategorized'),
    status: validator.string().default('new'),
    submitted_timestamp: validator.date().default(new Date()),
    updated_timestamp: validator.date().optional().default(new Date()),
})

export type Topic = validator.infer<typeof topicSchema>

export const exampleTopics: Topic[] = [
    { id: 1, name: 'Donald Trump Won!', description: 'Not sure how, but the big guy did it!', url: 'https://www.youtube.com/watch?v=SIyhICIJgU4', score: 0, submitter: 1, main: true, category: 'politics', status: 'new', submitted_timestamp: new Date('2024-09-17'), updated_timestamp: new Date() },
    { id: 2, name: 'Kamala Harris Won!', description: 'Not sure how, but the big gal did it!', url: 'https://www.youtube.com/watch?v=yHNRgOzOZ3A', score: 0, submitter: 1, main: false, category: 'funny', status: 'new', submitted_timestamp: new Date('2024-09-17'), updated_timestamp: new Date() },
    { id: 3, name: 'LA Won!', description: 'Not sure how, he wasn not even running!', url: 'https://www.youtube.com/watch?v=dFHH8pFGzAA', score: 0, submitter: 1, main: false, category: 'category 3', status: 'deleted', submitted_timestamp: new Date('2024-09-17'), updated_timestamp: new Date() }
]

export const topicsRoute = new Hono()
    .get('/', async (context) => {
        return context.json({ topcis: exampleTopics })
    })
    .get('id/:id{[0-9]+}', async (context) => {
        const id = Number.parseInt(context.req.param('id'))
        const topic = exampleTopics.find(topic => topic.id === id)
        if (!topic) {
            return context.notFound();
        }
        return context.json(topic)
    })
    .get('status/:status{^(new|deleted|pended)$}', async (context) => {
        const status = context.req.param('status')
        const topics = exampleTopics.filter(topic => topic.status === status)
        if (topics.length < 1) {
            return context.notFound()
        }
        return context.json({ 'topics': topics })
    })
    .post('/', zValidator('json', topicSchema), async (context) => {
        const data = context.req.valid('json');
        exampleTopics.push({ ...data, submitter: 1 })
        return context.json(exampleTopics)
    })
    .delete('/id/:id{[0-9]+}', async (context) => {
        const id = Number.parseInt(context.req.param('id'))
        const index = exampleTopics.findIndex(topic => topic.id === id)
        if (index === -1) {
            return context.notFound();
        }
        const deletedTopic = exampleTopics.splice(index, 1);
        context.status(201)
        return context.json({ 'topic': deletedTopic })

    })