const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const slugify = require('slugify')
const copyDir = require('copy-dir')
const untildify = require('untildify')

const PACKAGE_DIST_PATH = path.resolve(__dirname, 'documenter')

module.exports.workspaceActions = [
  {
    icon: 'fa-cloud-upload',
    label: 'Export HTML Documentation...',
    action: async (context, { workspace }) => {
      const rootPathConfigKey = `root_path_${workspace._id}`
      const outputPathConfigKey = `output_path_${workspace._id}`

      try {
        let outputPath = await context.app.prompt(
          'Output Path (e.g ~/Documents/My-Docs)',
          {
            submitName: 'Continue',
            defaultValue: await context.store.getItem(outputPathConfigKey)
          }
        )

        let rootPath = await context.app.prompt(
          'Documentation Root Path (No trailing slash e.g /docs)',
          {
            submitName: 'Export',
            defaultValue: await context.store.getItem(rootPathConfigKey)
          }
        )

        if (!outputPath.length) {
          outputPath = path.join(
            context.app.getPath('desktop'),
            `${slugify(workspace.name)}-API-Docs`
          )
        } else {
          outputPath = untildify(outputPath)
        }

        if (rootPath === '/') {
          rootPath = ''
        }

        await context.store.setItem(rootPathConfigKey, rootPath)

        await context.store.setItem(outputPathConfigKey, outputPath)

        try {
          await mkdirp(outputPath)
        } catch (e) {
          await context.app.alert(
            'Something went wrong!',
            'Unable to create output folder.'
          )

          return
        }

        try {
          copyDir.sync(PACKAGE_DIST_PATH, outputPath, {
            utimes: false,
            mode: false,
            cover: true
          })

          const indexFilePath = path.join(outputPath, 'index.html')

          fs.writeFileSync(
            indexFilePath,
            fs
              .readFileSync(indexFilePath)
              .toString()
              .replace('src="bundle.js"', `src="${rootPath}/bundle.js"`)
              .replace('href="bundle.css"', `href="${rootPath}/bundle.css"`)
              .replace('href="favicon.ico"', `href="${rootPath}/favicon.ico"`)
              .replace(
                'id="app"',
                `id="app"${
                  rootPath.length ? ' data-root="' + rootPath + '"' : ''
                }`
              )
          )
        } catch (_) {
          await context.app.alert(
            'Something went wrong!',
            'Unable to copy documenter files to output path.'
          )

          return
        }

        try {
          const data = await context.data.export.insomnia({
            workspace,
            format: 'json',
            includePrivate: false
          })

          fs.writeFileSync(path.join(outputPath, 'insomnia.json'), data)
        } catch (_) {
          await context.app.alert(
            'Something went wrong!',
            'Unable to export workspace data.'
          )

          return
        }

        await context.app.alert(
          'All Done!',
          `Your documentation has been created at "${outputPath}" and it's ready to be deployed!`
        )
      } catch (_) {}
    }
  }
]
