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

async function search(query) {
    const res = await fetch("https://raw.githubusercontent.com/Hester-Clapp/mlp-script-search/refs/heads/main/small.txt");
    // let res = await fetch("https://raw.githubusercontent.com/Hester-Clapp/mlp-script-search/refs/heads/main/transcript.txt");
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
            console.log(line);
        }
    }

    // If there's a line left after the stream ends
    if (buffer.length > 0) {
        console.log(buffer);
    }

}
search("gingerbread")