// eleventy.config.js
module.exports = function (eleventyConfig) {
    // Tell Eleventy to watch CSS files for changes
    eleventyConfig.addWatchTarget("./src/css/");

    // Tell Eleventy to copy the 'css' directory to the output folder '_site'
    eleventyConfig.addPassthroughCopy("./src/css");
    eleventyConfig.addPassthroughCopy("./src/js");
    eleventyConfig.addPassthroughCopy("./src/img"); // Make sure your images are in an 'img' folder

    // Add a filter to replace text (used for email in contact tile)
    eleventyConfig.addFilter("replace", function (value, search, replacement) {
        return value.replace(new RegExp(search, 'g'), replacement);
    });

    // Tells Eleventy where to look for files and where to build them
    return {
        dir: {
            input: "src",      // Your source files (templates, content)
            includes: "_includes", // Reusable layout parts
            data: "_data",       // Global data files
            output: "_site"     // Where the finished static site goes
        },
        passthroughFileCopy: true,
        templateFormats: ["md", "njk", "html"],
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
        dataTemplateEngine: "njk",
    };
};
