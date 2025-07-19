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

export async function search(query, check = target => target.toLowerCase().includes(query.toLowerCase())) {
    const lineBuffer = new CircularBuffer(8, 1000);
    const results = [];

    function checkLine(line) {
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