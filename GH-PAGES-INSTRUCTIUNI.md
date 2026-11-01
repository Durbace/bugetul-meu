# Publicare Bugetul Meu pe GitHub Pages

1. Creeaza pe github.com un repository PUBLIC numit `bugetul-meu`.
2. Deschide terminalul VS Code in folderul `bugetul-meu-angular` (acela in care este package.json).
3. Ruleaza comenzile de mai jos (inlocuieste USERNAME):

```bash
git init
git add .
git commit -m "Prima versiune Bugetul Meu"
git branch -M main
git remote add origin https://github.com/USERNAME/bugetul-meu.git
git push -u origin main
```

4. In repository: Settings > Pages > Build and deployment > Source: GitHub Actions.
5. In tabul Actions, urmareste workflow-ul `Publicare Bugetul Meu pe GitHub Pages`.
6. Dupa publicare, deschide https://USERNAME.github.io/bugetul-meu/

IMPORTANT: Datele sunt salvate in localStorage, separat pe fiecare browser si dispozitiv. GitHub Pages nu sincronizeaza datele. Exporta periodic backup JSON din aplicatie. Nu comite fisiere backup sau date personale in repo public.

Daca lucrezi deja intr-un repository Git, nu rula din nou `git init` / `git remote add` fara sa verifici configuratia existenta.
