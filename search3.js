async function search(query) {
    let res = await fetch("https://raw.githubusercontent.com/Hester-Clapp/mlp-script-search/refs/heads/main/titles.txt");
    // let req = await fetch("https://raw.githubusercontent.com/Hester-Clapp/mlp-script-search/refs/heads/main/transcript.txt");
    let raw = await res.text();
    console.log(raw)
}
search("gingerbread")