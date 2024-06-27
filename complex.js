import { Assistant, Tool, Thread } from "experts";
import ReadLine from "readline-sync";

class CityList {
    constructor() {
        this.cities = [];
    }

    addCity(_city) {
        const city = JSON.parse(_city).message;
        if (!this.cities.includes(city)) {
            this.cities.push(city);
            return `${city} has been added to the list.`;
        } else {
            return (`${city} is already in the list.`);
        }
    }

    listCities() {
        if (this.cities.length === 0) {
            return ("The list of cities is empty.");
        } else {
            var current_trip = ""
            current_trip += "List of cities: ";
            this.cities.forEach((city, index) => {
                current_trip += city + ",";
            });
            return current_trip;
        }
    }
}

const currentTrip = new CityList();

class AddCityTool extends Tool {
    constructor() {
        super(
            "Add City Tool",
            "Add a city to the trip plan",
            "This tool add a city to the current trip plan",
            {
                llm: false,
                parentsTools: [
                    {
                        type: "function",
                        function: {
                            name: AddCityTool.toolName,
                            description: "Add a city to the trip.",
                            parameters: {
                                type: "object",
                                properties: { message: { type: "string" } },
                                required: ["message"],
                            },
                        },
                    },
                ],
            });
    }

    async ask(_newcity) {
        currentTrip.addCity(_newcity);
        return `${_newcity} added to the trip.`;
    }
}

class ListCities extends Tool {
    constructor() {
        super(
            "List Cities",
            "List all the cities in the current trip plan",
            "This tool list all the cities in the current trip plan",
            {
                llm: false,
                parentsTools: [
                    {
                        type: "function",
                        function: {
                            name: ListCities.toolName,
                            description: "List citiess in the current trip plan.",
                            parameters: {},
                        },
                    },
                ],
            });
    }

    async ask() {
        return `Your trip currently has the following cities: ${currentTrip.listCities()} `;
    }
}

class DescribeCityTool extends Tool {
    constructor() {
        super(
            "Describe City Tool",
            "Describe a city with a single sentence",
            `You are coincise assistant that describe a city with a single sentence: do not go into too many details, 
             it is useful to grasp the "spirit" of the city`,
            {
                parameters: {
                    type: "object",
                    properties: {
                        city: {
                            "type": "string",
                            "description": "The city, e.g. Salerno"
                        },
                    },
                    "required": ["city"]
                }
            });
    }
}

class ClimateTool extends Tool {
    constructor() {
        super(
            "Climate in a city",
            "Describe the climate in a given city",
            "Get the climae for a specific city passed as parameter: do not go in too many details, just a sentence",
            {
                parameters: {
                    type: "object",
                    properties: {
                        city: {
                            "type": "string",
                            "description": "The city, e.g. Salerno"
                        },
                    },
                    "required": ["city"]
                }
            });
    }
}

class TripAssistant extends Assistant {
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
             If you cannot assist just say "Sorry, I can't help you with this". 
             You have a set of tools: 
             - You have specialized tools to handle the trip plan
             - You have a tool that describe a city with a single sentence
             - You have a tool that describs how generically is the weather in a city
             If asked without specifing the city applies all the tools to each city in the trip plan`,

        );
        this.addAssistantTool(DescribeCityTool);
        this.addAssistantTool(ClimateTool);
        this.addAssistantTool(AddCityTool);
        this.addAssistantTool(ListCities);
    }
}

const thread = await Thread.create();
const assistant = await TripAssistant.create({
    model: "gpt-3.5-turbo",
});

while (true) {
    let prompt = ReadLine.question(" 😊 > ");

    let output = await assistant.ask(prompt, thread.id);

    console.log(" 🤖 > " + output)
}