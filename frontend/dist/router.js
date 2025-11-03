const routes = {
    home : { html: "home.html", js: "home.js" },
    data : { html: "data.html", js: "data.js" },
    graph : { html: "graph.html", js: "graph.js" }
};

async function navigate(page)
{
    const route = routes[page];    
    if (!route)
        return;

    const html = await fetch(route.html).then(res => res.text());
    document.getElementById("content").innerHTML = html;  

    // if (!route.loaded && route.js !== "")
    if (!route.loaded)
    {
        const module = await import(`./${route.js}`);
        if (module.init)
            module.init();
        route.loaded = true;
    }
}
