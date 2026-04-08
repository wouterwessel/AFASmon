export class DialogSystem {
  constructor(scene) {
    this.scene = scene;
    this.dialogQueue = [];
    this.isActive = false;
    this.currentCallback = null;
    this.container = null;
  }

  show(dialogs, callback) {
    this.dialogQueue = Array.isArray(dialogs) ? [...dialogs] : [dialogs];
    this.currentCallback = callback || null;
    this.isActive = true;
    this.showNext();
  }

  showNext() {
    if (this.dialogQueue.length === 0) {
      this.hide();
      return;
    }

    const dialog = this.dialogQueue.shift();
    this.renderDialog(dialog);
  }

  renderDialog(dialog) {
    if (this.container) this.container.destroy();

    const { scene } = this;
    const w = 760;
    const h = 140;
    const x = 20;
    const y = scene.cameras.main.height - h - 20;

    this.container = scene.add.container(x, y).setDepth(1000);

    // Background
    const bg = scene.add.rectangle(0, 0, w, h, 0x000000, 0.85)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xF57C00);
    this.container.add(bg);

    // Speaker name
    if (dialog.speaker) {
      const nameBg = scene.add.rectangle(10, -12, 0, 24, 0x00529C)
        .setOrigin(0, 0);
      const nameText = scene.add.text(18, -9, dialog.speaker, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
      });
      nameBg.width = nameText.width + 16;
      this.container.add([nameBg, nameText]);
    }

    // Message text with typewriter effect
    const msgText = scene.add.text(20, 20, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: w - 40 },
      lineSpacing: 6,
    });
    this.container.add(msgText);

    // Typewriter effect
    const fullText = dialog.text;
    let charIndex = 0;
    this.typeTimer = scene.time.addEvent({
      delay: 25,
      callback: () => {
        charIndex++;
        msgText.setText(fullText.substring(0, charIndex));
        if (charIndex >= fullText.length) {
          this.typeTimer.remove();
          this.showContinueIndicator();
        }
      },
      repeat: fullText.length - 1,
    });

    // Click/key to advance (also skip typewriter)
    const advance = () => {
      if (charIndex < fullText.length) {
        // Skip typewriter
        this.typeTimer.remove();
        charIndex = fullText.length;
        msgText.setText(fullText);
        this.showContinueIndicator();
      } else {
        scene.input.off('pointerdown', advance);
        scene.input.keyboard.off('keydown-SPACE', advance);
        scene.input.keyboard.off('keydown-ENTER', advance);

        if (dialog.choices) {
          this.showChoices(dialog.choices);
        } else {
          this.showNext();
        }
      }
    };

    scene.input.on('pointerdown', advance);
    scene.input.keyboard.on('keydown-SPACE', advance);
    scene.input.keyboard.on('keydown-ENTER', advance);
  }

  showContinueIndicator() {
    if (!this.container) return;
    const indicator = this.scene.add.text(730, 115, '▼', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#F57C00',
    });
    this.scene.tweens.add({
      targets: indicator,
      y: indicator.y + 5,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
    this.container.add(indicator);
  }

  showChoices(choices) {
    if (!this.container) return;

    choices.forEach((choice, i) => {
      const cy = 70 + i * 30;
      const choiceBg = this.scene.add.rectangle(400, cy, 300, 26, 0x00529C, 0.6)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(1, 0xF57C00);

      const choiceText = this.scene.add.text(400, cy, choice.text, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        color: '#ffffff',
      }).setOrigin(0.5);

      choiceBg.on('pointerover', () => choiceBg.setFillStyle(0xF57C00, 0.8));
      choiceBg.on('pointerout', () => choiceBg.setFillStyle(0x00529C, 0.6));
      choiceBg.on('pointerdown', () => {
        if (choice.action) choice.action();
        this.showNext();
      });

      this.container.add([choiceBg, choiceText]);
    });
  }

  hide() {
    this.isActive = false;
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    if (this.typeTimer) this.typeTimer.remove();
    if (this.currentCallback) this.currentCallback();
  }
}
