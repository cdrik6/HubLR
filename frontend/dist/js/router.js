let currentModule;

const routes = {
    home : { html: "/html/home.html", js: "" },
    data : { html: "/html/data.html", js: "data.js" },
    graph : { html: "/html/graph.html", js: "graph.js" },
    gradient : { html: "/html/gradient.html", js: "gradient.js" },
    model : { html: "/html/model.html", js: "model.js" }
};

async function navigate(page)
{
    const route = routes[page];    
    if (!route)
        return (console.log(`${page} page does not exist`));

    const html = await fetch(route.html).then(res => res.text());
    document.getElementById("content").innerHTML = html;

    if (currentModule && currentModule.cleanup)    
        currentModule.cleanup();
    
    if (!route.module && route.js !== "")    
        route.module = await import(`./${route.js}`);
       
    currentModule = route.module; 

    if (currentModule && currentModule.init)        
        currentModule.init();
}

window.navigate = navigate; // make global navigate()