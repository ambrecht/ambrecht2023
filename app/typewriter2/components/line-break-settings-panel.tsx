'use client';

/**
 * @file line-break-settings-panel.tsx
 * @description Komponente für das Einstellungspanel für den Zeilenumbruch
 */

import React from 'react';
import { useState } from 'react';
import { Settings, Moon, Sun, Trash2 } from 'lucide-react';
import type { LineBreakSettingsPanelProps } from '../types';
import InputField from './input-field';
import Button from './button';

/**
 * Die Komponente LineBreakSettingsPanel rendert ein Panel mit Einstellungen
 * für den Zeilenumbruch und die Schriftgröße.
 *
 * @component
 * @param props - Die Eigenschaften der Komponente
 */
const LineBreakSettingsPanel: React.FC<LineBreakSettingsPanelProps> = ({
  fontSize,
  setFontSize,
  lineBreakConfig,
  updateLineBreakConfig,
  darkMode,
  toggleDarkMode,
  clearCurrentInput,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Öffnet oder schließt das Panel
   */
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  /**
   * Behandelt Änderungen der Schriftgröße
   *
   * @param e - Das Änderungsevent des Eingabefeldes
   */
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Number(e.target.value);
    // Stelle sicher, dass die Schriftgröße im gültigen Bereich liegt
    if (newSize >= 24 && newSize <= 50) {
      setFontSize(newSize);
    }
  };

  /**
   * Behandelt Änderungen der Zeilenumbruchkonfiguration
   *
   * @param e - Das Änderungsevent des Eingabefeldes oder der Checkbox
   */
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      updateLineBreakConfig({ [name]: checked });
    } else if (type === 'number') {
      const numValue = Number(value);
      if (numValue >= 10 && numValue <= 200) {
        updateLineBreakConfig({ [name]: numValue });
      }
    }
  };

  /**
   * Behandelt den Klick auf den Löschen-Button
   */
  const handleClearClick = () => {
    {
      clearCurrentInput();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Zahnrad-Button */}
      <button
        onClick={togglePanel}
        className={`p-2 rounded-full ${
          darkMode
            ? 'bg-gray-700 hover:bg-gray-600'
            : 'bg-[#e2dfda] hover:bg-[#d3d0cb]'
        } focus:outline-none transition-colors duration-200`}
        title="Einstellungen"
        aria-label="Einstellungen öffnen"
        aria-expanded={isOpen}
        aria-controls="settings-panel"
      >
        <Settings
          className={`h-5 w-5 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}
        />
      </button>

      {/* Einstellungs-Popup */}
      {isOpen && (
        <div
          id="settings-panel"
          className={`absolute right-0 mt-2 p-4 ${
            darkMode
              ? 'bg-gray-800 border-gray-700 text-gray-200'
              : 'bg-white border-gray-200 text-gray-800'
          } border shadow-lg rounded-lg z-20 w-80`}
          role="dialog"
          aria-labelledby="settings-title"
        >
          <div className="flex justify-between items-center mb-3">
            <h4 id="settings-title" className="font-bold">
              Einstellungen
            </h4>
            <button
              onClick={togglePanel}
              className={`${
                darkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label="Einstellungen schließen"
            >
              ✕
            </button>
          </div>

          {/* Schriftgröße */}
          <div className="mb-4">
            <h5
              className={`font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              } mb-2`}
            >
              Schriftgröße
            </h5>
            <div className="flex items-center gap-2">
              <label
                htmlFor="fontSize"
                className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Größe (24-50):
              </label>
              <InputField
                id="fontSize"
                type="number"
                min={24}
                max={50}
                value={fontSize}
                onChange={handleFontSizeChange}
                className={`${
                  darkMode
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-[#ebe8e3] text-[#222]'
                } w-16 text-xs h-8 rounded-md`}
                aria-label="Schriftgröße einstellen"
              />
            </div>
          </div>

          {/* Zeilenumbruch */}
          <div className="mb-4">
            <h5
              className={`font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              } mb-2`}
            >
              Zeilenumbruch
            </h5>

            {/* Automatische Berechnung */}
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="autoMaxChars"
                className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
                title="Aktivieren Sie diese Option, um die maximale Zeichenanzahl automatisch anhand der aktuellen Breite zu berechnen."
              >
                Automatische Berechnung:
              </label>
              <input
                type="checkbox"
                id="autoMaxChars"
                name="autoMaxChars"
                checked={lineBreakConfig.autoMaxChars}
                onChange={handleConfigChange}
                className={`h-4 w-4 ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
                } rounded focus:ring-blue-500`}
              />
            </div>

            {/* Maximale Zeichen pro Zeile */}
            <div className="mb-2">
              <label
                htmlFor="maxCharsPerLine"
                className={`block text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                } mb-1`}
                title="Falls die automatische Berechnung deaktiviert ist, geben Sie hier die maximale Zeichenanzahl ein (10-200)."
              >
                Maximale Zeichen pro Zeile (10-200):
              </label>
              <InputField
                id="maxCharsPerLine"
                type="number"
                name="maxCharsPerLine"
                min={10}
                max={200}
                value={lineBreakConfig.maxCharsPerLine}
                onChange={handleConfigChange}
                disabled={lineBreakConfig.autoMaxChars}
                className={`${
                  darkMode
                    ? 'bg-gray-700 text-gray-200 disabled:bg-gray-800 disabled:text-gray-500'
                    : 'bg-[#ebe8e3] text-[#222] disabled:bg-gray-200 disabled:text-gray-500'
                } w-full text-xs h-8 rounded-md`}
              />
            </div>

            <p
              className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              } mt-2`}
            >
              Wörter, die nicht vollständig in eine Zeile passen, werden
              automatisch in die nächste Zeile verschoben.
            </p>
          </div>

          {/* Nachtmodus */}
          <div className="mb-4">
            <h5
              className={`font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              } mb-2`}
            >
              Darstellung
            </h5>
            <Button
              onClick={toggleDarkMode}
              className={`w-full flex items-center justify-center gap-2 ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  : 'bg-[#d3d0cb] hover:bg-[#c4c1bc] text-gray-800'
              }`}
              aria-pressed={darkMode}
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {darkMode ? 'Tagmodus aktivieren' : 'Nachtmodus aktivieren'}
            </Button>
          </div>

          {/* Löschen */}
          <div className="mb-4">
            <h5
              className={`font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              } mb-2`}
            >
              Aktionen
            </h5>
            <Button
              onClick={handleClearClick}
              className={`w-full flex items-center justify-center gap-2 ${
                darkMode
                  ? 'bg-red-800 hover:bg-red-700 text-gray-200'
                  : 'bg-red-100 hover:bg-red-200 text-red-800'
              }`}
            >
              <Trash2 className="h-4 w-4" />
              Aktuelle Eingabe löschen
            </Button>
          </div>

          <button
            onClick={togglePanel}
            className={`mt-4 w-full px-3 py-2 rounded-md transition-colors duration-200 ${
              darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-[#d3d0cb] hover:bg-[#c4c1bc] text-gray-800'
            }`}
            aria-label="Einstellungen schließen"
          >
            Schließen
          </button>
        </div>
      )}
    </div>
  );
};

export default LineBreakSettingsPanel;
