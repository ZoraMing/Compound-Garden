import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { DataPoint } from '../types';
import { COLORS } from '../constants';

interface PhaserGameProps {
  data: DataPoint[];
  currentYearIndex: number;
  targetValue?: number | null; // New prop for FIRE line
  targetLabel?: string;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ data, currentYearIndex, targetValue, targetLabel }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<MainScene | null>(null);
  const latestProps = useRef({ data, currentYearIndex, targetValue, targetLabel });

  // Update ref whenever props change
  useEffect(() => {
    latestProps.current = { data, currentYearIndex, targetValue, targetLabel };
  }, [data, currentYearIndex, targetValue, targetLabel]);

  class MainScene extends Phaser.Scene {
    private chartGraphics!: Phaser.GameObjects.Graphics;
    private labelsContainer!: Phaser.GameObjects.Container;

    // Increased left margin to fit currency labels
    private margin = { top: 60, right: 30, bottom: 40, left: 60 };
    private chartWidth = 0;
    private chartHeight = 0;

    constructor() {
      super('MainScene');
    }

    create() {
      // Set background to match the "Paper" color
      this.cameras.main.setBackgroundColor(COLORS.bg);

      this.chartGraphics = this.add.graphics();
      this.labelsContainer = this.add.container(0, 0);

      this.updateChartDimensions();

      sceneRef.current = this;

      if (data.length > 0) {
        this.drawChart(data, currentYearIndex, targetValue, targetLabel);
      }

      // Handle resize internally in scene if needed, but we use the external ResizeObserver mostly
      this.scale.on('resize', this.resize, this);
    }

    resize(gameSize: Phaser.Structs.Size) {
      const width = gameSize.width;
      const height = gameSize.height;

      this.cameras.main.setViewport(0, 0, width, height);
      this.updateChartDimensions();

      // Use latest data from ref to prevent stale closure issues during resize
      const { data, currentYearIndex, targetValue, targetLabel } = latestProps.current;
      this.drawChart(data, currentYearIndex, targetValue, targetLabel);
    }

    updateChartDimensions() {
      const { width, height } = this.scale;
      this.chartWidth = width - this.margin.left - this.margin.right;
      this.chartHeight = height - this.margin.top - this.margin.bottom;
    }

    drawChart(allData: DataPoint[], currentIndex: number, target?: number | null, tLabel?: string) {
      if (!this.chartGraphics) return;

      this.chartGraphics.clear();
      this.labelsContainer.removeAll(true); // Clear old text objects

      if (allData.length === 0 || this.chartWidth <= 0 || this.chartHeight <= 0) return;

      const maxTime = allData[allData.length - 1].timeIndex;
      let maxBalance = allData[allData.length - 1].balance;

      // If we have a target, make sure the chart scales to include it (plus some padding)
      if (target && target > maxBalance) {
        maxBalance = target;
      }

      // Ensure min maxBalance to avoid division by zero
      if (maxBalance === 0) maxBalance = 100;

      const scaleX = maxTime > 0 ? this.chartWidth / maxTime : 0;
      // Add padding to top (1.1x)
      const scaleY = this.chartHeight / (maxBalance * 1.1);

      const originX = this.margin.left;
      const originY = this.margin.top + this.chartHeight;

      // --- 1. Draw Grid (Checkerboard/Lines) ---
      const gridRows = 5;

      this.chartGraphics.lineStyle(1, COLORS.grid, 0.3);

      // Horizontal Grid Lines & Y-Axis Labels
      for (let r = 0; r <= gridRows; r++) {
        const y = originY - (this.chartHeight * (r / gridRows));
        const value = (maxBalance * 1.1) * (r / gridRows);

        // Line
        this.chartGraphics.lineBetween(originX, y, originX + this.chartWidth, y);

        // Label
        const labelText = this.add.text(originX - 10, y, `$${this.formatCurrencyShort(value)}`, {
          fontFamily: 'Nunito',
          fontSize: '11px',
          color: '#93A1A1'
        }).setOrigin(1, 0.5);
        this.labelsContainer.add(labelText);
      }

      // Vertical Grid Lines (Time)
      const gridCols = Math.min(allData.length - 1, 10);
      for (let c = 0; c <= gridCols; c++) {
        const x = originX + (this.chartWidth * (c / gridCols));
        this.chartGraphics.lineBetween(x, this.margin.top, x, originY);
      }

      // --- 2. Area Charts ---
      const totalPoints: { x: number, y: number }[] = [];
      const principalPoints: { x: number, y: number }[] = [];

      totalPoints.push({ x: originX, y: originY });
      principalPoints.push({ x: originX, y: originY });

      allData.forEach(d => {
        const x = originX + d.timeIndex * scaleX;
        const yTotal = originY - d.balance * scaleY;
        const yPrinc = originY - d.totalPrincipal * scaleY;

        totalPoints.push({ x, y: yTotal });
        principalPoints.push({ x, y: yPrinc });
      });

      totalPoints.push({ x: originX + maxTime * scaleX, y: originY });
      principalPoints.push({ x: originX + maxTime * scaleX, y: originY });

      // Draw Interest (Total) Fill
      this.chartGraphics.fillStyle(COLORS.interest, 0.2);
      this.chartGraphics.fillPoints(totalPoints, true);

      // Draw Interest Stroke
      this.chartGraphics.lineStyle(4, COLORS.interest, 1);
      this.chartGraphics.strokePoints(totalPoints.slice(0, -1), false, false);

      // Draw Principal Fill
      this.chartGraphics.fillStyle(COLORS.principal, 0.2);
      this.chartGraphics.fillPoints(principalPoints, true);

      // Draw Principal Stroke
      this.chartGraphics.lineStyle(4, COLORS.principal, 1);
      this.chartGraphics.strokePoints(principalPoints.slice(0, -1), false, false);

      // --- 3. Draw Target Line (FIRE) if exists ---
      if (target) {
        const yTarget = originY - target * scaleY;
        if (yTarget >= this.margin.top) {
          this.chartGraphics.lineStyle(2, COLORS.highlight, 1);
          // Dashed line
          let dx = originX;
          while (dx < originX + this.chartWidth) {
            this.chartGraphics.lineBetween(dx, yTarget, Math.min(dx + 10, originX + this.chartWidth), yTarget);
            dx += 20;
          }

          // Label for Target
          const targetBg = this.add.rectangle(originX + this.chartWidth - 5, yTarget - 12, 100, 20, COLORS.bg).setOrigin(1, 0.5);
          const targetText = this.add.text(originX + this.chartWidth - 5, yTarget - 12, `${tLabel || 'Goal'}: $${this.formatCurrencyShort(target)}`, {
            fontFamily: 'Nunito', fontSize: '12px', color: '#B58900', fontStyle: 'bold'
          }).setOrigin(1, 0.5);
          this.labelsContainer.add(targetBg);
          this.labelsContainer.add(targetText);
        }
      }

      // --- 4. Current Year Indicator ---
      const currentD = allData[currentIndex];
      if (currentD) {
        const cx = originX + currentD.timeIndex * scaleX;
        const cyTotal = originY - currentD.balance * scaleY;
        const cyPrinc = originY - currentD.totalPrincipal * scaleY;

        // Vertical Line
        this.chartGraphics.lineStyle(2, COLORS.text, 0.5);
        this.chartGraphics.lineBetween(cx, this.margin.top, cx, originY);

        // --- Current Value Indicators on Y-Axis ---

        // 1. Total Indicator Line (Horizontal from point to axis)
        this.chartGraphics.lineStyle(1, COLORS.interest, 0.5);
        this.chartGraphics.lineBetween(originX, cyTotal, cx, cyTotal);

        // Label Background on Y-Axis
        const totalLabelText = `$${this.formatCurrencyShort(currentD.balance)}`;
        const totalBgRect = this.add.rectangle(originX - 35, cyTotal, 60, 20, COLORS.interest).setOrigin(0.5);
        const totalText = this.add.text(originX - 35, cyTotal, totalLabelText, {
          fontFamily: 'Nunito', fontSize: '12px', color: '#FFF', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.labelsContainer.add(totalBgRect);
        this.labelsContainer.add(totalText);

        // 2. Principal Indicator Line
        // Only show if separate enough to avoid overlap, or just render it
        if (Math.abs(cyTotal - cyPrinc) > 22) {
          this.chartGraphics.lineStyle(1, COLORS.principal, 0.5);
          this.chartGraphics.lineBetween(originX, cyPrinc, cx, cyPrinc);

          const princLabelText = `$${this.formatCurrencyShort(currentD.totalPrincipal)}`;
          const princBgRect = this.add.rectangle(originX - 35, cyPrinc, 60, 20, COLORS.principal).setOrigin(0.5);
          const princText = this.add.text(originX - 35, cyPrinc, princLabelText, {
            fontFamily: 'Nunito', fontSize: '12px', color: '#FFF', fontStyle: 'bold'
          }).setOrigin(0.5);
          this.labelsContainer.add(princBgRect);
          this.labelsContainer.add(princText);
        }

        // Points on chart
        this.chartGraphics.fillStyle(COLORS.bg, 1);
        this.chartGraphics.lineStyle(3, COLORS.interest, 1);
        this.chartGraphics.fillCircle(cx, cyTotal, 6);
        this.chartGraphics.strokeCircle(cx, cyTotal, 6);

        this.chartGraphics.fillStyle(COLORS.bg, 1);
        this.chartGraphics.lineStyle(3, COLORS.principal, 1);
        this.chartGraphics.fillCircle(cx, cyPrinc, 6);
        this.chartGraphics.strokeCircle(cx, cyPrinc, 6);
      }
    }

    formatCurrencyShort(value: number): string {
      if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
      if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
      return value.toFixed(0);
    }
  }

  useEffect(() => {
    // Prevent double init in Strict Mode or if ref already exists
    if (gameRef.current) return;

    // Check for container
    if (!containerRef.current) return;

    const { clientWidth, clientHeight } = containerRef.current;

    // Critical fix: Do not initialize Phaser if dimensions are invalid or zero.
    // This often causes 'Framebuffer status: Incomplete Attachment' errors.
    if (clientWidth <= 0 || clientHeight <= 0) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: clientWidth,
      height: clientHeight,
      backgroundColor: COLORS.bg,
      scene: MainScene,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.NO_CENTER
      }
    };
    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    // ResizeObserver is safer than window resize event for component-based resizing
    const resizeObserver = new ResizeObserver((entries) => {
      if (!gameRef.current || !containerRef.current) return;

      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          gameRef.current.scale.resize(width, height);
          if (sceneRef.current) {
            sceneRef.current.resize(gameRef.current.scale.gameSize);
          }
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current && data.length > 0) {
      sceneRef.current.drawChart(data, currentYearIndex, targetValue, targetLabel);
    }
  }, [currentYearIndex, data, targetValue, targetLabel]);

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
