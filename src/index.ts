import { Feed, Item } from "feed";
import express from 'express';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import 'dotenv/config'

function asyncClient() {
    return new Promise<Client<true>>((res, rej) => {
        const client = new Client({intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds]});

        client.once(Events.ClientReady, readyClient => {
            console.log(`Ready! Logged in as ${readyClient.user.tag}`);
            res(readyClient);
        });
        
        client.once(Events.Error, rej)

        client.login(process.env.BOT_TOKEN)
    });
}

const client = await asyncClient();

const channel = client.channels.cache.get(process.env.CHANNEL!)

const app = express();

app.get('/rss.xml', async (req, res) => {
    if (!channel?.isTextBased()) return;
    const messages = await channel.messages.fetch()

    const feed = new Feed({
        title: "Discord Updates",
        id: "http://example.com/",
        copyright: "All rights reserved 2023, My Name",
    });
    
    messages.forEach(e => {
        feed.addItem({
            date: e.createdAt,
            link: e.url,
            title: e.guild?.name ?? 'Unknown server',
            content: e.content,
            image: e.attachments.first()?.url
        })
    })

    res.setHeader("Content-Type", "application/rss+xml");
    res.send(feed.rss2())
})

app.listen(3000, () => {
    console.log('Server running')
})
