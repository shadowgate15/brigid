// Custom nx release version actions for the `claude-plugin` project.
//
// The plugin is NOT an npm package, but its version lives in three tracked files that must
// stay in lockstep:
//   1. packages/claude-plugin/package.json         (the version source of truth nx bumps)
//   2. packages/claude-plugin/.claude-plugin/plugin.json
//   3. .claude-plugin/marketplace.json             (repo root — the plugin's entry)
//
// We extend @nx/js's JsVersionActions so package.json versioning/changelog/tagging keep working
// exactly as for any other project, then additionally write the new version into plugin.json and
// the marketplace entry. All writes go through the Nx `tree`, so they are committed atomically in
// the same release commit as the package.json bump.
const { updateJson } = require('@nx/devkit');
const JsVersionActions = require('@nx/js/src/release/version-actions').default;

const MARKETPLACE_PATH = '.claude-plugin/marketplace.json';

class ClaudePluginVersionActions extends JsVersionActions {
  /**
   * @param {import('@nx/devkit').Tree} tree
   * @param {string} newVersion
   * @returns {Promise<string[]>} log messages
   */
  async updateProjectVersion(tree, newVersion) {
    // Let @nx/js bump package.json (and any configured manifest roots) first.
    const logMessages = await super.updateProjectVersion(tree, newVersion);

    const projectRoot = this.projectGraphNode.data.root;
    const pluginJsonPath = `${projectRoot}/.claude-plugin/plugin.json`;

    // 1. plugin.json
    let pluginName;
    updateJson(tree, pluginJsonPath, (json) => {
      json.version = newVersion;
      pluginName = json.name;
      return json;
    });
    logMessages.push(`✍️  New version ${newVersion} written to ${pluginJsonPath}`);

    // 2. root marketplace.json — update this plugin's entry (matched by name)
    if (tree.exists(MARKETPLACE_PATH)) {
      updateJson(tree, MARKETPLACE_PATH, (json) => {
        for (const plugin of json.plugins ?? []) {
          if (plugin.name === pluginName) {
            plugin.version = newVersion;
          }
        }
        return json;
      });
      logMessages.push(`✍️  New version ${newVersion} written to ${MARKETPLACE_PATH}`);
    }

    return logMessages;
  }
}

module.exports = ClaudePluginVersionActions;
module.exports.default = ClaudePluginVersionActions;
