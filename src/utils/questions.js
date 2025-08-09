export const QUIZ_QUESTIONS = [
    {
        question: "What is the capital of France?",
        correct: "Paris",
        options: ["Paris", "London", "Berlin", "Rome"]
    },
    {
        question: "Which planet is closest to the Sun?",
        correct: "Mercury",
        options: ["Mercury", "Venus", "Earth", "Mars"]
    },
    {
        question: "What is 2 + 2?",
        correct: "4",
        options: ["3", "4", "5", "6"]
    },
    {
        question: "Who painted the Mona Lisa?",
        correct: "Leonardo da Vinci",
        options: ["Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Michelangelo"]
    },
    {
        question: "What is the largest ocean on Earth?",
        correct: "Pacific Ocean",
        options: ["Atlantic Ocean", "Pacific Ocean", "Indian Ocean", "Arctic Ocean"]
    },
    {
        question: "Which gas do plants absorb from the atmosphere?",
        correct: "Carbon Dioxide",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"]
    },
    {
        question: "What is the smallest prime number?",
        correct: "2",
        options: ["1", "2", "3", "5"]
    },
    {
        question: "Which continent is Egypt located in?",
        correct: "Africa",
        options: ["Asia", "Africa", "Europe", "South America"]
    },
    {
        question: "What is H2O commonly known as?",
        correct: "Water",
        options: ["Water", "Hydrogen", "Oxygen", "Salt"]
    },
    {
        question: "How many sides does a triangle have?",
        correct: "3",
        options: ["2", "3", "4", "5"]
    },
    {
        question: "What year did World War II end?",
        correct: "1945",
        options: ["1943", "1944", "1945", "1946"]
    },
    {
        question: "Which element has the chemical symbol 'O'?",
        correct: "Oxygen",
        options: ["Gold", "Silver", "Oxygen", "Iron"]
    },
    {
        question: "What is the fastest land animal?",
        correct: "Cheetah",
        options: ["Lion", "Cheetah", "Horse", "Gazelle"]
    },
    {
        question: "How many continents are there?",
        correct: "7",
        options: ["5", "6", "7", "8"]
    },
    {
        question: "What is the main ingredient in bread?",
        correct: "Flour",
        options: ["Sugar", "Salt", "Flour", "Water"]
    }
];

export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
