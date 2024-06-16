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
            "AddCityTool",
            "Add a city to the trip",
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
            "ListCities",
            "List all the cities in the current trip",
            "This tool list all the cities in the current trip plan",
            {
                llm: false,
                parentsTools: [
                    {
                        type: "function",
                        function: {
                            name: ListCities.toolName,
                            description: "List citiess in the current trip.",
                            parameters: { },
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
            "DescribeCityTool",
            "Describe a city",
            "This tool describes a City with a single sentence",
        );
    }
}

class CurrentWeatherTool extends Tool {
    constructor() {
        super(
            "SuggestCityTool",
            "Describe a city",
            "Get the current temperature for a specific location",
            {
                parameters: {
                    type: "object",
                    properties: {
                        city: {
                            "type": "string",
                            "description": "The city and state, e.g., San Francisco, CA"
                        },
                        unit: {
                            type: "string",
                            enum: ["Celsius", "Fahrenheit"],
                            description: "The temperature unit to use. Infer this from the user's location."
                        }
                    },
                    "required": ["location", "unit"]
                }
            });
    }
}

class TripAssistant extends Assistant {
    constructor() {
        super(
            "TripAssistant",
            "Conversational trip planner",
            `You are a trip planner. The human will start his interactions by citing a City. If not then answer with "Sorry I cannot help you with this. I can only plan a trip".
             You assist the user in planning a trip across different cities.
             If none of the tools can be useful for the user just say "I can't help you sorry"`,

        );
        this.addAssistantTool(DescribeCityTool);
        this.addAssistantTool(CurrentWeatherTool);
        this.addAssistantTool(AddCityTool);
        this.addAssistantTool(ListCities);
    }
}




// export OPENAI_API_KEY="sk-proj-Rr699RbvqY2J3U1y24u1T3BlbkFJFlk58JtpVHnw3b3f8zJw"
const thread = await Thread.create();
const assistant = await TripAssistant.create({
    model: "gpt-3.5-turbo",
});

while (true) {
    let prompt = ReadLine.question("> ");

    let output = await assistant.ask(prompt, thread.id);

    console.log(output)
}