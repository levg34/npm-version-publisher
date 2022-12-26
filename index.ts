import args from 'args'
import { getVersionIncreaseFromCommit, tag as createTag } from './git-utils'
import { Version } from './version'
import { getVersionTypeFromCmd } from './version-utils'

args.options([
    {
        name: 'increase',
        description: 'The type of version to increment. For example, M or major increments the major version, m the minor, and f the fix',
        defaultValue: 'minor'
    },
    {
        name: 'tag',
        description: 'Returns the tag to create',
        defaultValue: false
    },
    {
        name: 'ci',
        'description': 'Use in CI environment. If true, determines the version solely from the last commit message (release:[fix|minor|major]). Example: release:fix fix the broken thing.',
        defaultValue: false
    }
])

const flags = args.parse(process.argv)

const main = async () => {
    try {
        const version = await Version.readFromPackageJson()
        const oldVersion = version.toString()
        if (flags.tag) {
            console.log(version.getTag())
        } else {
            if (flags.ci) {
                const increase = await getVersionIncreaseFromCommit()
                version.increment(increase)
            } else {
                version.increment(getVersionTypeFromCmd(flags.increase))
            }
            await version.save();
            // commit the version change
            // tag
            // await createTag(version.getTag())
            console.log('Upgraded from version '+oldVersion+' to version '+version.toString()+'.')
        }
    } catch (error) {
        console.error(error);
    }
}

main()
