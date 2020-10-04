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
      let outputPath = await context.app.prompt(
        'Output Path (e.g ~/Documents/My-Docs)',
        {
          submitName: 'Export'
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

      try {
        await mkdirp(outputPath)
      } catch (e) {
        await context.app.alert(
          'Something went wrong!',
          'Unable to create output folder.'
        )
        return
      }

      const data = await context.data.export.insomnia({
        workspace,
        format: 'json',
        includePrivate: false
      })

      try {
        copyDir.sync(PACKAGE_DIST_PATH, outputPath, {
          utimes: false,
          mode: false,
          cover: true
        })
      } catch (_) {
        await context.app.alert(
          'Something went wrong!',
          'Unable to copy documenter files to output path.'
        )
        return
      }

      fs.writeFileSync(path.join(outputPath, 'insomnia.json'), data)

      await context.app.alert(
        'All Done!',
        `Your documentation has been created at "${outputPath}" and it's ready to be deployed!`
      )
    }
  }
]
