import Phaser from "phaser";
import coinSvgUrl from "../assets/coin.svg?url";
import { WORLD } from "../config.js";

function makeTexture(scene, key, w, h, color) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(color, 1);
  g.fillRect(0, 0, w, h);
  g.generateTexture(key, w, h);
  g.destroy();
}

/**
 * Nivel único: plataformas, monedas, enemigos, huecos, meta, jefe final.
 * Controles: `registry.get("controlsRef")` (ref React con moveX, mouthOpen, sprint, eyeShoot).
 */
export class MainGameScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainGameScene" });
  }

  preload() {
    this.load.image("tex_coin", coinSvgUrl);
    makeTexture(this, "tex_player", 36, 52, 0x38bdf8);
    makeTexture(this, "tex_ground", 120, 24, 0x334155);
    makeTexture(this, "tex_enemy", 34, 34, 0xf97316);
    makeTexture(this, "tex_flag", 28, 40, 0xa855f7);
    makeTexture(this, "tex_fire", 12, 12, 0xf43f5e);
    makeTexture(this, "tex_boss", 72, 72, 0xbe123c);
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD.width, WORLD.height);
    this.physics.world.gravity.y = 980;

    this.controlsRef = this.game.registry.get("controlsRef");
    this.onHud = this.game.registry.get("onHudUpdate") ?? (() => {});
    this.onVictory = this.game.registry.get("onVictory") ?? (() => {});
    this.onGameOver = this.game.registry.get("onGameOver") ?? (() => {});

    this.score = 0;
    this.lives = 3;
    this.coinsCollected = 0;
    this.jumpCooldown = 0;
    this.shootCooldown = 0;
    this.bossHp = 5;
    this.bossTouchMs = 0;
    this.hitCd = 0;

    this.add.rectangle(0, 0, WORLD.width, WORLD.height, 0x0f172a).setOrigin(0);

    this.add.particles(0, 0, "tex_coin", {
      x: { min: 0, max: WORLD.width },
      y: { min: 0, max: 220 },
      lifespan: 5000,
      speedY: { min: 6, max: 22 },
      scale: { start: 0.12, end: 0 },
      quantity: 1,
      frequency: 140,
      tint: [0x475569, 0x94a3b8],
    });

    this.platforms = this.physics.add.staticGroup();
    this._buildWorld();

    this.player = this.physics.add.sprite(120, 400, "tex_player");
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 48);
    this.player.body.setOffset(4, 4);
    this.player.setDragX(900);
    this.player.setMaxVelocity(420, 900);

    this.physics.add.collider(this.player, this.platforms);

    this.coins = this.physics.add.group({ allowGravity: false });
    this._spawnCoins();
    this._startCoinIdleMotion();

    this.enemies = this.physics.add.group();
    this._spawnEnemies();
    this.physics.add.collider(this.enemies, this.platforms);

    this.flag = this.physics.add.sprite(
      WORLD.width - 200,
      WORLD.groundY - 80,
      "tex_flag",
    );
    this.flag.body.setAllowGravity(false);
    this.flag.body.moves = false;

    this.boss = this.physics.add.sprite(
      WORLD.width - 520,
      WORLD.groundY - 100,
      "tex_boss",
    );
    this.boss.body.setAllowGravity(false);
    this.boss.setImmovable(true);
    this.boss.body.setSize(60, 60);

    this.projectiles = this.physics.add.group();

    this.physics.add.overlap(this.player, this.coins, (_, coin) => {
      if (!coin.active) return;
      coin.disableBody(true, true);
      this.coinsCollected += 1;
      this.score += 100;
      this._emitHud();
      this._burst(coin.x, coin.y, 0xfacc15);
    });

    this.physics.add.overlap(this.player, this.enemies, (p, enemy) => {
      if (!enemy.active) return;
      if (p.body.velocity.y > 55 && p.body.bottom <= enemy.body.top + 16) {
        enemy.disableBody(true, true);
        this.score += 250;
        p.setVelocityY(-380);
        this._emitHud();
        this.cameras.main.shake(90, 0.004);
        this._burst(enemy.x, enemy.y, 0xf97316);
      } else if (this.hitCd <= 0) {
        this.hitCd = 900;
        this._damagePlayer(1);
      }
    });

    this.physics.add.overlap(this.player, this.flag, () => {
      this.onVictory();
      this.scene.pause();
    });

    this.physics.add.overlap(this.player, this.boss, () => {
      const now = this.time.now;
      if (now - this.bossTouchMs < 650) return;
      this.bossTouchMs = now;
      this._damagePlayer(1);
    });

    this.physics.add.overlap(this.projectiles, this.boss, (ball) => {
      if (!this.boss.active) return;
      ball.destroy();
      this.bossHp -= 1;
      this.score += 150;
      this._emitHud();
      this.cameras.main.shake(120, 0.006);
      if (this.bossHp <= 0) {
        this.boss.disableBody(true, true);
        this._burst(this.boss.x, this.boss.y, 0xf43f5e);
      }
    });

    this.physics.add.overlap(this.projectiles, this.enemies, (ball, enemy) => {
      ball.destroy();
      if (!enemy.active) return;
      enemy.disableBody(true, true);
      this.score += 180;
      this._emitHud();
      this._burst(enemy.x, enemy.y, 0xf97316);
    });

    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(160, 90);

    this._emitHud();
  }

  /** Suelo con huecos + plataformas flotantes (rectángulos estáticos). */
  _buildWorld() {
    const top = WORLD.groundY - 12;
    for (let x = 60; x < WORLD.width - 80; x += 120) {
      if (this._isGap(x)) continue;
      const p = this.platforms.create(x, top, "tex_ground");
      p.refreshBody();
    }

    const rects = [
      [420, 500, 160, 18],
      [780, 455, 160, 18],
      [1180, 415, 150, 18],
      [1750, 470, 200, 18],
      [2100, 385, 130, 18],
      [2680, 435, 170, 18],
      [3000, 355, 140, 18],
      [3500, 445, 220, 18],
      [3900, 400, 150, 18],
      [4200, 335, 170, 18],
    ];
    for (const [cx, cy, w, h] of rects) {
      const r = this.add.rectangle(cx, cy, w, h, 0x334155);
      this.physics.add.existing(r, true);
      this.platforms.add(r);
    }
  }

  _isGap(centerX) {
    const gaps = [
      [820, 1020],
      [1480, 1720],
      [2360, 2580],
      [3180, 3400],
    ];
    return gaps.some(([a, b]) => centerX >= a && centerX <= b);
  }

  _spawnCoins() {
    const gy = WORLD.groundY - 40;
    const spots = [
      [440, 455],
      [800, 410],
      [1200, 375],
      [1780, 430],
      [2120, 345],
      [2700, 400],
      [3020, 320],
      [3520, 410],
      [3920, 365],
      [4220, 305],
      [620, gy],
      [2050, gy],
      [3350, gy],
    ];
    for (const [x, y] of spots) {
      const c = this.coins.create(x, y, "tex_coin");
      c.body.setAllowGravity(false);
      c.setDisplaySize(22, 22);
      c.body.setCircle(11);
      c.refreshBody();
    }
  }

  _startCoinIdleMotion() {
    this.coins.children.iterate((coin) => {
      if (!coin?.active) return;
      const y0 = coin.y;
      const delay = Phaser.Math.Between(0, 550);
      this.tweens.add({
        targets: coin,
        y: y0 - 7,
        angle: { from: -5, to: 5 },
        duration: 700 + Phaser.Math.Between(0, 200),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay,
      });
    });
  }

  _spawnEnemies() {
    const ey = WORLD.groundY - 34;
    const spots = [520, 1280, 2200, 2880, 3600];
    for (const x of spots) {
      const e = this.enemies.create(x, ey, "tex_enemy");
      e.setBounce(1, 0);
      e.setCollideWorldBounds(true);
      e.setVelocityX(Phaser.Math.Between(0, 1) ? 95 : -95);
    }
  }

  _emitHud() {
    this.onHud({
      score: this.score,
      lives: this.lives,
      coins: this.coinsCollected,
      bossHp: this.bossHp,
    });
  }

  _burst(x, y, tint) {
    const p = this.add.particles(x, y, "tex_coin", {
      speed: { min: -140, max: 140 },
      angle: { min: 0, max: 360 },
      lifespan: 450,
      quantity: 12,
      scale: { start: 0.35, end: 0 },
      tint,
    });
    this.time.delayedCall(500, () => p.destroy());
  }

  _damagePlayer(amount = 1) {
    this.lives -= amount;
    this.cameras.main.shake(200, 0.012);
    this.player.setVelocity(0, -420);
    this.player.setPosition(Math.max(100, this.player.x - 70), 380);
    this._emitHud();
    if (this.lives <= 0) {
      this.onGameOver();
      this.scene.pause();
    }
  }

  update(time, delta) {
    const c = this.controlsRef?.current;
    if (!c) return;

    this.jumpCooldown = Math.max(0, this.jumpCooldown - delta);
    this.shootCooldown = Math.max(0, this.shootCooldown - delta);
    this.hitCd = Math.max(0, this.hitCd - delta);

    const runMul = c.sprint ? 1.55 : 1;
    const maxX = c.sprint ? 320 : 220;
    this.player.setAccelerationX(c.moveX * 980 * runMul);
    this.player.setMaxVelocity(maxX, 900);

    if (c.moveX < -0.08) this.player.setFlipX(true);
    else if (c.moveX > 0.08) this.player.setFlipX(false);

    if (
      c.mouthOpen > 0.2 &&
      this.jumpCooldown <= 0 &&
      this.player.body.blocked.down
    ) {
      const strength = Phaser.Math.Clamp(c.mouthOpen, 0.2, 1);
      const vy = -(360 + strength * 280);
      this.player.setVelocityY(vy);
      this.jumpCooldown = 340;
    }

    const eyeThr = this.game.registry.get("eyeShootThreshold") ?? 0.58;
    /** Disparo entrecerrando ojos + boca casi cerrada (evita saltos) y sin sprint fuerte. */
    const shootIntent =
      c.eyeShoot >= eyeThr && c.mouthOpen < 0.16 && c.smile < 0.45;
    if (shootIntent && this.shootCooldown <= 0) {
      const ball = this.projectiles.create(
        this.player.x + (this.player.flipX ? -28 : 28),
        this.player.y - 4,
        "tex_fire",
      );
      ball.body.setAllowGravity(false);
      ball.setVelocityX(this.player.flipX ? -440 : 440);
      ball.setVelocityY(-50);
      this.shootCooldown = 540;
      this.cameras.main.shake(55, 0.003);
    }

    this.enemies.children.iterate((e) => {
      if (!e?.body) return;
      if (Math.abs(e.body.velocity.x) < 24) {
        e.setVelocityX(e.body.velocity.x >= 0 ? 95 : -95);
      }
    });

    if (this.player.y > WORLD.height + 100) {
      this._damagePlayer(1);
      this.player.setPosition(120, 380);
    }
  }
}
