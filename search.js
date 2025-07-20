class CircularBuffer {
    constructor(length, size) {
        this.buffer = new Array(size);
        this.head = 0;
        this.tail = 0;
        this.maxLength = length;
        this.size = size;
        this.length = 0;
    }

    add(item) {
        if (this.length === this.size) throw new Error("Queue full");
        if (this.length === this.maxLength) {
            this.head = (this.head + 1) % this.size; // Overwrite the oldest item
        } else {
            this.length++;
        }
        this.buffer[this.tail] = item;
        this.tail = (this.tail + 1) % this.size;
    }

    dequeue() {
        if (this.length === 0) return undefined;
        const item = this.buffer[this.head];
        this.head = (this.head + 1) % this.size;
        this.length--;
        return item;
    }

    get contents() {
        let output = []
        for (let i = this.head; i !== this.tail; i = (i + 1) % this.size) {
            output.push(this.buffer[i]);
        }
        return output;
    }
}

async function stream(checkLine) {
    // const res = await fetch("https://raw.githubusercontent.com/Hester-Clapp/mlp-script-search/refs/heads/main/small.txt");
    const res = await fetch("https://raw.githubusercontent.com/Hester-Clapp/mlp-script-search/refs/heads/main/transcript.txt");
    if (!res.body) throw new Error("no response body");

    const stream = res.body.pipeThrough(new TextDecoderStream());
    const reader = stream.getReader();

    let textBuffer = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        textBuffer += value;
        const lines = textBuffer.split("\n");

        // Leave last partial line in buffer
        textBuffer = lines.pop() ?? "";

        for (const line of lines) {
            checkLine(line);
        }
    }
    // If there's a line left after the stream ends
    if (textBuffer.length > 0) {
        checkLine(textBuffer);
    }
}

export async function search(query, check = target => new RegExp(`\\b${query}\\b`, "i").test(target) && !new RegExp(`\\[[^\\]]*${query}`, "i").test(target)) {
    const lineBuffer = new CircularBuffer(8, 1000);
    const results = [];

    function checkLine(line) {
        if (results.length >= 1024) return // Limit number of results to 1024 to avoid excessive load

        lineBuffer.add(line);
        let targetLine = lineBuffer.contents[4] || "";
        if (check(targetLine)) {
            results.push(lineBuffer.contents);
        }
    }

    await stream(checkLine);
    return results;
}
export async function searchRegex(query, flags = "") {
    return await search(query, target => new RegExp(query, flags).test(target));
}
export async function searchSentence(sentence) {
    function filterResults(scenes, query) {
        return scenes.filter(lines => new RegExp(`\\b${query}\\b`).test(lines[4])) // Remove results that do not match the rest of the sentence
    }
    function subSentence(length) {
        return words.slice(0, length).join(" ");
    }

    let words = typeof sentence === "string" ? sentence.split(" ") : sentence;
    if (words.length === 0) return [];

    let i = 0
    let results = await search(words[0]);
    if (results.length === 0) return [{ phrase: words.join(" "), scenes: [] }]
    let filtered = results
    for (i = 0; filtered.length > 0 && i < words.length; i++) {
        results = filtered
        filtered = filterResults(filtered, subSentence(i + 2));
    }

    return [{ phrase: subSentence(i), scenes: results }].concat(await searchSentence(words.slice(i))); // Add the rest of the sentence
}