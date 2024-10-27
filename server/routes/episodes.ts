import { Hono } from "hono";
import { Schema, z as validator, } from "zod";
import { zValidator } from "@hono/zod-validator";

import { exampleTopics, topicSchema, type Topic } from "./topics";

export const episodeSchema = validator.object({
    id: validator.number(),
    name: validator.string(),
    description: validator.string(),
    topics: validator.array(validator.object({ id: validator.number() })).optional(),
    created: validator.date().default(new Date()),
    completed: validator.date().optional(),
    updated_timestamp: validator.date().optional().default(new Date()),
})

type Episode = validator.infer<typeof episodeSchema>

const exampleEpisodes: Episode[] = [
    { id: 1, name: 'Episode 1', description: 'The Vote Part 1', topics: [{ id: 3 }], created: new Date('2024-09-17'), completed: new Date(), updated_timestamp: new Date() },
    { id: 2, name: 'Episode 2', description: 'The Vote Part 2', topics: [{ id: 1 }], created: new Date('2024-09-17'), completed: new Date(), updated_timestamp: new Date() },
    { id: 3, name: 'Episode 3', description: 'The Vote Part 3', topics: [{ id: 1 }, { id: 2 }, { id: 3 }], created: new Date('2024-09-17'), completed: new Date(), updated_timestamp: new Date() }
]

export const episodesRoute = new Hono()
    .get('/', async (context) => {
        // @TODO - remember to check when in a DB if this resets somehow
        let filteredTopics: any[] = [];
        let episodesAndTopics = [...exampleEpisodes];
        episodesAndTopics.forEach(episode => {
            episode.topics?.forEach(topicid => {
                let filter = exampleTopics.filter(topic => topicid.id === topic.id)
                // @ts-ignore
                filteredTopics.push(filter)
            })
            episode.topics = filteredTopics;
            filteredTopics = []
        })
        return context.json({ 'episodes': episodesAndTopics })
    })
    .get('id/:id{[0-9]+}', async (context) => {
        const id = Number.parseInt(context.req.param('id'));
        const episode = exampleEpisodes.find(episode => episode.id === id);
        if (!episode) {
            return context.notFound();
        }
        let filteredTopics: Topic[] = [];
        console.log(episode)
        episode.topics?.forEach(element => {
            // @ts-ignore
            filteredTopics.push(exampleTopics.filter(topic => element.id === topic.id))
        });
        episode.topics = filteredTopics;
        return context.json({ 'episode': episode })
    })
    .get('name/:name{[a-zA-Z0-9]+}', async (context) => {
        const name = context.req.param('name');
        const episode = exampleEpisodes.find(episode => episode.name === name);
        if (!episode) {
            return context.notFound();
        }
        return context.json({ 'episode': episode })
    })
    .post('/', zValidator('json', episodeSchema), async (context) => {
        const data = context.req.valid('json');
        exampleEpisodes.push({ ...data })
        console.log(exampleEpisodes)
        return context.json(data)
    })
    .delete('/:id{[0-9]+}', async (context) => {
        const id = Number.parseInt(context.req.param('id'))
        const index = exampleEpisodes.findIndex(episode => episode.id === id)
        if (index === -1) {
            return context.notFound();
        }
        const deletedEpisode = exampleEpisodes.splice(index, 1)
        context.status(201)
        return context.json({ 'episode': deletedEpisode })
    })