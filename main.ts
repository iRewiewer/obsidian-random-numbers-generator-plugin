import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface Settings {
    seedValue: number;
    lowRange: number;
    highRange: number;
}

const DEFAULT_SETTINGS: Settings = {
    seedValue: Math.floor(Math.random() * (10 ** 12)),
    lowRange: 1,
    highRange: 100,
}

const addText = (editor: Editor, text: string) => {
    const cursor = editor.getCursor();
    editor.replaceRange(text, cursor);
    editor.setCursor(cursor.line, cursor.ch + text.length);
};

const commandCallback = async (editor: Editor, settings: Settings) => {
    const seed = parseFloat(`0.${settings.seedValue.toString()}`);
    // Seeded random number in [0,1)
    const randomNumber: number = Math.floor(((Math.random() + seed) % 1) * settings.highRange + settings.lowRange);

    addText(editor, `${randomNumber} `);
}

export default class MyPlugin extends Plugin {
    settings: Settings;

    async onload() {
        await this.loadSettings();

        console.log("Loading Random Number Generator [v1.0]");

        const commands = [
            {
                id: 'random-int',
                name: `Generate a random integer. Range can be modified in settings.`,
                editorCallback: (editor: Editor) => commandCallback(editor, this.settings)
            }
        ];

        for (const command of commands) {
            this.addCommand(command);
        }

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
