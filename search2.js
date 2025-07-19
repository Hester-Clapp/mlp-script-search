import { readLines } from "https://deno.land/std/io/mod.ts";

class Buffer {
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

// async function fetchLines(url, func) {
//     const res = await fetch(url);
//     const body = res.body
//         ?.pipeThrough(new TextDecoderStream());

//     if (!body) throw new Error("No response body");

//     const reader = readLines(body);

//     for await (const line of reader) {
//         func(line)
//     }
// }

// async function search(query, compare = (a, b) => a.toLowerCase().includes(b.toLowerCase())) {
//     const lineBuffer = new Buffer(10, 1000);
//     const results = [];
//     await fetchLines("./transcript.txt", (line) => {
//         lineBuffer.add(newLine);
//         let target = lineBuffer.contents[6] || ""
//         if (compare(target, query)) {
//             results.push({
//                 epID: target.slice(0, 3),
//                 context: lineBuffer.contents
//             })
//         }
//     });
//     return results;
// }

// console.log(await search("gingerbread"))

import transcript from "./transcript.txt" assert { type: "text" };
console.log(transcript);