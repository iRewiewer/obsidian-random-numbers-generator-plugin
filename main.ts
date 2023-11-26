import { App, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
    seedValue: number;
    lowRange: number;
    highRange: number;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    seedValue: Math.floor(Math.random() * (10 ** 12)),
    lowRange: 1,
    highRange: 100,
}

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;

    async onload() {
        await this.loadSettings();

        console.log("Loading Random Number Generator")

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: 'random-int',
            name: `Generate a random integer. Range can be modified in settings.`,
            callback: async () => {
                // Generate a random number
                const seed = parseFloat(`0.${this.settings.seedValue.toString()}`);
                const RNG = (Math.random() + seed) % 1;
                const randomNumber: number = Math.floor(RNG * this.settings.highRange + this.settings.lowRange);
                const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

                if (activeView) {
                    const editor = activeView.editor;
                    const cursorPos = editor.getCursor();
                    if (cursorPos) {
                        editor.replaceRange(`${randomNumber} `, cursorPos);
                        editor.setCursor(cursorPos.line, cursorPos.ch + randomNumber.toString().length + 1);
                    }
                }
            }
        });


        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new SettingsTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class SettingsTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Seed')
            .setDesc('Leave empty for a random one. (Default: secret)')
            .addText(text => text
                .setPlaceholder('Enter seed')
                .setValue(this.plugin.settings.seedValue.toString())
                .onChange(async (value) => {
                    // replace any non digit with ascii value modulo 1 trillion
                    this.plugin.settings.seedValue = parseInt(value.replace(/\D/g, (match) => match.charCodeAt(0).toString())) % (10 ** 12);
                    if (isNaN(this.plugin.settings.seedValue)) {
                        this.plugin.settings.seedValue = 0;
                    }
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Low range value')
            .setDesc('Set the low point of the random range. (Default: 1)')
            .addText(text => text
                .setPlaceholder('Enter number')
                .setValue(this.plugin.settings.lowRange.toString())
                .onChange(async (value) => {
                    // replace any non digit with ascii value modulo 1 trillion
                    this.plugin.settings.lowRange = parseInt(value.replace(/\D/g, ''));
                    text.setValue(this.plugin.settings.lowRange.toString());
                    if (isNaN(this.plugin.settings.seedValue)) {
                        this.plugin.settings.seedValue = 1;
                    }
                    if (text.getValue() == "NaN") {
                        text.setValue("");
                    }
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('High range value')
            .setDesc('Set the high point of the random range. (Default: 100)')
            .addText(text => text
                .setPlaceholder('Enter number')
                .setValue(this.plugin.settings.highRange.toString())
                .onChange(async (value) => {
                    // replace any non digit with ascii value modulo 1 trillion
                    this.plugin.settings.highRange = parseInt(value.replace(/\D/g, ''));
                    text.setValue(this.plugin.settings.highRange.toString());
                    if (isNaN(this.plugin.settings.seedValue)) {
                        this.plugin.settings.seedValue = 100;
                    }
                    if (text.getValue() == "NaN") {
                        text.setValue("");
                    }
                    await this.plugin.saveSettings();
                }));
    }
}
