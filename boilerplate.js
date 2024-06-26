import { Assistant, Tool, Thread } from "experts";
import ReadLine from "readline-sync";


class SimpleAssistant extends Assistant {
    constructor() {
        super(
            "Conversational Travel Guide Assistant",
            `The Travel Guide Assistant helps you effortlessly plan and enjoy your trips by 
             suggesting destinations, creating personalized itineraries, and providing local tips. 
             It also offers language support and travel advice to ensure a seamless and enjoyable experience.`,
            `Please act as my Travel Guide Assistant. Your primary task is to help me 
             plan and enjoy my trip. Focus on suggesting destinations, creating itineraries, 
             providing local information, translating common phrases, and offering travel tips. 
             Always ensure that the information you provide is accurate, relevant, and tailored to my preferences. 
             Avoid off-topic responses and concentrate solely on assisting with travel-related inquiries and tasks
             If you cannot assist just say "Sorry, I can't help you with this"`,
        );
    }
}

const thread = await Thread.create();
const assistant = await SimpleAssistant.create({
    model: "gpt-3.5-turbo",
});

while (true) {
    let prompt = ReadLine.question(" 😊 > ");

    let output = await assistant.ask(prompt, thread.id);

    console.log(" 🤖 > " + output)
}