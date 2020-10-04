# insomnia-plugin-documenter

Export Insomnia workspace HTML documentation.

## How it Works?

The plugin provides a workspace action labelled `Export HTML Documentation..`, on click it will ask for the output path and there is support for `~` paths e.g `~/dev/AwesomeProject/docs` but if you did not provide one it defaults to your `Desktop` folder with a folder named by your workspace slugified name.

After exporting, you will see a success message that contains path to the generated docs folder and it is ready to be deployed anywhere that support static HTML hosting (e.g GitHub Pages, Vercel, Netlify etc).

## Credits

- Insomnia Documenter CLI tool (https://github.com/jozsefsallai/insomnia-documenter)
