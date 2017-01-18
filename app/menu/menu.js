
export class Menu {
	constructor(game) {
		this.game = game
		this.group = this.game.add.group()
		this.selected = 0
		this.menu = []
	}

	isVisible() {
		return this.group.visible
	}

	selectNext() {
		this.selectIndex(this.selected+1)
	}

	selectPrev() {
		this.selectIndex(this.selected+this.menu.length-1)
	}

	selectIndex(i=0) {
		this.select(this.menu[i%this.menu.length])
	}

	hide() {
		this.group.visible = false
	}

	show() {
		this.group.visible = true
	}

	exists(text) {
		return this.menu.indexOf(text)
	}

	onAction() {
		let item = this.group.getAt(this.selected)
		item.action()
	}

	select(text) {
		if (!text) {
			return this.selectIndex()
		}
		let f = this.menu.indexOf(text)
		this.group.setAll('strokeThickness', 2)
		let item  = this.group.getAt(f)
		item.strokeThickness = 6
		this.selected = f
	}

	addMenuItem(text, x=100, y=false, action) {
		if (this.exists(text) !== -1) {
			console.log(this.exists(text))
			return [...this.menu]
		}
		let N = this.menu.length
		let posY = y || this.group.getAt(N-1).bottom + 5
		let m = this.game.add.text(x, posY, text)
		m.setShadow(2, 2, "#333333", 2, true, true)
		m.inputEnabled = true
		m.padding.set(10, 0)
		m.stroke = '#de77ae'
		m.strokeThickness = 2
		m.action = action
		this.menu.push(text)
		this.group.add(m)
		return [...this.menu]
	}

/*
unused, untested
	removeMenu(text) {
		let i = this.exists(text)
		if (i === -1)
			return [...this.menu]
		
		let item = this.group.removeChildAt(i)
		item.destroy()
		this.menu.slice(i, 1)
		return [...this.menu]
	}
*/
}

export default Menu