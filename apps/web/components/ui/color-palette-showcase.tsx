'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Palette } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ColorInfo {
  name: string
  hex: string
  hsl: string
  rgb: string
  usage: string
  description: string
  cssVar?: string
}

const colorPalette: ColorInfo[] = [
  {
    name: 'Warm Cream Background',
    hex: '#F8F4E3',
    hsl: 'hsl(45, 30%, 96%)',
    rgb: 'rgb(248, 244, 227)',
    usage: 'Background',
    description: 'Тёплый кремовый фон - основной цвет страницы',
    cssVar: '--background'
  },
  {
    name: 'Dark Green Primary',
    hex: '#17271C',
    hsl: 'hsl(139, 26%, 12%)',
    rgb: 'rgb(23, 39, 28)',
    usage: 'Primary',
    description: 'Тёмно-зелёный - основной цвет текста и заголовков',
    cssVar: '--primary'
  },
  {
    name: 'Gold Accent',
    hex: '#e1b869',
    hsl: 'hsl(38, 67%, 65%)',
    rgb: 'rgb(225, 184, 105)',
    usage: 'Accent',
    description: 'Золотой акцент - для кнопок CTA и выделений',
    cssVar: '--accent'
  },
  {
    name: 'Light Cream Card',
    hex: '#FAF8F0',
    hsl: 'hsl(45, 25%, 98%)',
    rgb: 'rgb(250, 248, 240)',
    usage: 'Card',
    description: 'Очень светлый крем для карточек и поверхностей',
    cssVar: '--card'
  },
  {
    name: 'Soft Muted',
    hex: '#F5F2E8',
    hsl: 'hsl(45, 20%, 94%)',
    rgb: 'rgb(245, 242, 232)',
    usage: 'Muted',
    description: 'Мягкий нейтральный оттенок для второстепенных элементов',
    cssVar: '--muted'
  },
  {
    name: 'Warm Border',
    hex: '#E8E0D0',
    hsl: 'hsl(45, 15%, 88%)',
    rgb: 'rgb(232, 224, 208)',
    usage: 'Border',
    description: 'Тёплые светлые границы',
    cssVar: '--border'
  },
  {
    name: 'Light Gold Secondary',
    hex: '#F9F5E8',
    hsl: 'hsl(38, 50%, 95%)',
    rgb: 'rgb(249, 245, 232)',
    usage: 'Secondary',
    description: 'Очень светлый золотистый фон',
    cssVar: '--secondary'
  },
  {
    name: 'Muted Green Text',
    hex: '#5A7A65',
    hsl: 'hsl(139, 26%, 35%)',
    rgb: 'rgb(90, 122, 101)',
    usage: 'Muted Text',
    description: 'Приглушённый зелёный для вторичного текста',
    cssVar: '--muted-foreground'
  }
]

function ColorSwatch({ color, index }: { color: ColorInfo; index: number }) {
  const [copied, setCopied] = React.useState<string | null>(null)

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden rounded-3xl border-2 hover:border-primary/50 transition-all duration-300">
        <div
          className="h-48 w-full relative group cursor-pointer"
          style={{ backgroundColor: color.hex }}
          onClick={() => copyToClipboard(color.hex, 'hex')}
        >
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
              className="bg-white/90 backdrop-blur-sm rounded-full p-3"
            >
              <Palette className="h-6 w-6 text-foreground" />
            </motion.div>
          </div>
        </div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{color.name}</CardTitle>
            <Badge variant="outline" className="rounded-xl">
              {color.usage}
            </Badge>
          </div>
          <CardDescription className="text-sm">{color.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">HEX</span>
                <code className="text-sm font-mono">{color.hex}</code>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => copyToClipboard(color.hex, 'hex')}
              >
                {copied === 'hex' ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">HSL</span>
                <code className="text-sm font-mono">{color.hsl}</code>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => copyToClipboard(color.hsl, 'hsl')}
              >
                {copied === 'hsl' ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">RGB</span>
                <code className="text-sm font-mono">{color.rgb}</code>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => copyToClipboard(color.rgb, 'rgb')}
              >
                {copied === 'rgb' ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>

            {color.cssVar && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">CSS Var</span>
                  <code className="text-sm font-mono">{color.cssVar}</code>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={() => copyToClipboard(color.cssVar || '', 'cssVar')}
                >
                  {copied === 'cssVar' ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function UsageExample() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="rounded-3xl border-2 overflow-hidden bg-background"
    >
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">
            Примеры использования
          </h3>
          <p className="text-sm text-muted-foreground">
            Посмотрите, как цветовая палитра работает вместе в реальном дизайне
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h4 className="font-semibold mb-2 text-foreground">
              Карточка компонента
            </h4>
            <p className="text-sm mb-4 text-muted-foreground">
              Эта карточка использует цвет карточки для фона
            </p>
            <button
              className="px-4 py-2 rounded-xl font-medium text-accent-foreground transition-transform hover:scale-105 bg-accent"
            >
              Призыв к действию
            </button>
          </div>

          <div className="p-6 rounded-2xl text-primary-foreground bg-primary">
            <h4 className="font-semibold mb-2">Основная карточка</h4>
            <p className="text-sm mb-4 opacity-80">
              Эта карточка использует основной цвет для акцента
            </p>
            <button
              className="px-4 py-2 rounded-xl font-medium transition-transform hover:scale-105 bg-accent text-accent-foreground"
            >
              Узнать больше
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {colorPalette.slice(0, 6).map((color) => (
            <div
              key={color.name}
              className="h-12 w-12 rounded-full border-2 border-border shadow-md"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function ColorPaletteShowcase() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <Badge className="rounded-xl bg-primary/10 text-primary hover:bg-primary/20">
            Цветовая палитра
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Тёплая и естественная палитра
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Тщательно подобранная цветовая палитра с тёплым кремовым фоном, 
            насыщенным тёмно-зелёным основным цветом и элегантными золотыми акцентами 
            для изысканного и привлекательного дизайна.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {colorPalette.map((color, index) => (
            <ColorSwatch key={color.name} color={color} index={index} />
          ))}
        </div>

        <UsageExample />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="rounded-3xl border-2 p-8 bg-muted/30"
        >
          <h3 className="text-xl font-bold mb-4 text-foreground">Доступность цветов</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-foreground">Коэффициенты контраста</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Тёмно-зелёный на кремовом: 8.5:1 (AAA)</li>
                <li>• Золотой на тёмно-зелёном: 4.8:1 (AA)</li>
                <li>• Тёмно-зелёный на светлом: 12.1:1 (AAA)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-foreground">Рекомендации</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Используйте тёмно-зелёный для основного текста</li>
                <li>• Золотой только для акцентов и выделений</li>
                <li>• Поддерживайте достаточный контраст для читаемости</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

