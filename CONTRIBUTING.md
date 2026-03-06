# Contributing to Student Result Portal

First off, thank you for considering contributing to Student Result Portal! 🎉

It's people like you that make Student Result Portal such a great tool for educational institutions worldwide.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [support@resultportal.com](mailto:support@resultportal.com).

## 🤝 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/aryapatel23/Result-portal/issues) to avoid duplicates.

**When you create a bug report, include:**

- **Clear and descriptive title**
- **Detailed description** of the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** (if applicable)
- **Environment details:**
  - OS: [e.g. Windows 11, macOS 13, Ubuntu 22.04]
  - Node.js version: [e.g. 18.16.0]
  - Browser: [e.g. Chrome 115, Safari 16]
  - Version: [e.g. 1.0.0]

Use our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md).

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**When creating an enhancement suggestion, include:**

- **Clear and descriptive title**
- **Detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List potential implementation approaches**
- **Include mockups or examples** (if applicable)

Use our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md).

### 📝 Improving Documentation

Documentation improvements are always welcome! You can:

- Fix typos or grammatical errors
- Add missing documentation
- Improve existing explanations
- Add code examples
- Translate documentation
- Create tutorials or guides

### 💻 Code Contributions

Unsure where to begin? Look for issues labeled:

- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements

## 🔄 Development Workflow

### 1. Fork the Repository

Click the 'Fork' button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/Result-portal.git
cd Result-portal
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/aryapatel23/Result-portal.git
```

### 4. Create a Branch

```bash
# Create and checkout a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch Naming Convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 5. Set Up Development Environment

**Backend:**
```bash
cd Backend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

**Frontend:**
```bash
cd Frontend
npm install
npm run dev
```

**Mobile App:**
```bash
cd ResultApp
npm install
npm start
```

### 6. Make Your Changes

- Write clean, readable code
- Follow our [Coding Standards](#coding-standards)
- Add tests for new features
- Update documentation if needed
- Test your changes thoroughly

### 7. Run Tests

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd Frontend
npm test

# Linting
npm run lint

# Type checking (if using TypeScript)
npm run type-check
```

### 8. Commit Your Changes

Follow our [Commit Guidelines](#commit-guidelines):

```bash
git add .
git commit -m "feat: add student bulk import validation"
```

### 9. Keep Your Branch Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge upstream changes into your branch
git merge upstream/main
```

### 10. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 11. Create Pull Request

Go to the original repository and click "New Pull Request". Fill out our [PR template](.github/PULL_REQUEST_TEMPLATE.md).

## 📏 Coding Standards

### JavaScript/TypeScript Style Guide

We follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with some modifications.

**Key Points:**

```javascript
// ✅ Good
const studentName = 'John Doe';
const getStudentById = async (id) => {
  const student = await Student.findById(id);
  return student;
};

// ❌ Bad
const student_name = 'John Doe';
function GetStudentById(id) {
  return Student.findById(id);
}
```

**General Rules:**

1. **Use ES6+ features** - Arrow functions, destructuring, async/await
2. **Meaningful names** - Variables and functions should be self-documenting
3. **Keep functions small** - Each function should do one thing well
4. **Add comments** - Explain "why", not "what"
5. **Handle errors** - Always include error handling
6. **Avoid magic numbers** - Use named constants

### React/JSX Best Practices

```jsx
// ✅ Good - Functional components with hooks
import React, { useState, useEffect } from 'react';

const StudentList = ({ students }) => {
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    setFilteredStudents(students.filter(s => s.active));
  }, [students]);

  return (
    <div className="student-list">
      {filteredStudents.map(student => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  );
};

export default StudentList;
```

**React Rules:**

1. Use functional components with hooks
2. Keep components small and focused
3. Extract reusable logic into custom hooks
4. Use PropTypes or TypeScript for type checking
5. Avoid inline styles (use Tailwind classes)

### File Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   └── features/       # Feature-specific components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
├── utils/              # Utility functions
├── constants/          # Constants and enums
├── types/              # TypeScript types/interfaces
└── styles/             # Global styles
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `StudentCard.jsx` |
| **Hooks** | camelCase with 'use' | `useStudentData.js` |
| **Utilities** | camelCase | `formatDate.js` |
| **Constants** | UPPER_SNAKE_CASE | `API_BASE_URL` |
| **CSS Classes** | kebab-case | `student-list-item` |
| **Files** | kebab-case or PascalCase | `student-service.js` |

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation only changes
- `style` - Code style changes (formatting, semicolons, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes
- `build` - Build system changes

### Examples

```bash
# Feature
git commit -m "feat(students): add bulk import with Excel validation"

# Bug fix
git commit -m "fix(attendance): resolve face recognition timeout issue"

# Documentation
git commit -m "docs(api): update authentication endpoints documentation"

# Breaking change
git commit -m "feat(auth): migrate to JWT refresh token rotation

BREAKING CHANGE: Old refresh tokens will no longer work"
```

### Commit Message Rules

1. **Use imperative mood** - "add" not "added" or "adds"
2. **Don't capitalize first letter** - "feat: add feature" not "Feat: Add feature"
3. **No period at the end** - "feat: add feature" not "feat: add feature."
4. **Keep subject under 50 characters**
5. **Separate subject from body with blank line**
6. **Wrap body at 72 characters**
7. **Use body to explain what and why, not how**

## 🔍 Pull Request Process

### Before Submitting

- ✅ Code follows our style guidelines
- ✅ Self-review completed
- ✅ Comments added for complex code
- ✅ Documentation updated
- ✅ Tests added/updated and passing
- ✅ No console.log or debug code
- ✅ No merge conflicts

### PR Title Format

Follow the same format as commit messages:

```
feat(students): add advanced search filters
fix(results): correct percentage calculation
docs(readme): update installation instructions
```

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## How to Test
1. Step 1
2. Step 2
3. Expected result

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Process

1. **Automated Checks** - CI/CD pipeline must pass
2. **Code Review** - At least one maintainer approval required
3. **Testing** - All tests must pass
4. **Documentation** - Check if docs need updates
5. **Merge** - Squash and merge preferred

### After Your PR is Merged

1. Delete your branch (both local and remote)
2. Update your fork's main branch
3. Celebrate! 🎉

```bash
# Delete local branch
git branch -d feature/your-feature-name

# Delete remote branch
git push origin --delete feature/your-feature-name

# Update your fork
git checkout main
git pull upstream main
git push origin main
```

## 🧪 Testing Guidelines

### Writing Tests

```javascript
// Example test structure
describe('Student Service', () => {
  describe('createStudent', () => {
    it('should create a new student with valid data', async () => {
      // Arrange
      const studentData = {
        name: 'John Doe',
        email: 'john@example.com',
        class: '10',
        section: 'A'
      };

      // Act
      const result = await createStudent(studentData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(studentData.name);
      expect(result.email).toBe(studentData.email);
    });

    it('should throw error with invalid email', async () => {
      const studentData = {
        name: 'John Doe',
        email: 'invalid-email',
        class: '10',
        section: 'A'
      };

      await expect(createStudent(studentData))
        .rejects
        .toThrow('Invalid email format');
    });
  });
});
```

### Test Coverage

Aim for:
- **80%+ overall coverage**
- **100% coverage for critical paths** (authentication, payments, data validation)
- **All edge cases tested**

```bash
# Run tests with coverage
npm test -- --coverage
```

## 📚 Additional Resources

### Learning Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Documentation](https://react.dev/)
- [MongoDB University](https://university.mongodb.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

### Tools We Use

- **IDE**: VS Code (recommended extensions listed in `.vscode/extensions.json`)
- **API Testing**: Postman
- **Database**: MongoDB Compass
- **Version Control**: Git & GitHub
- **CI/CD**: GitHub Actions

## 💬 Community

### Getting Help

- 📧 **Email**: support@resultportal.com
- 💬 **Discord**: [Join our community](https://discord.gg/resultportal)
- 🐦 **Twitter**: [@resultportal](https://twitter.com/resultportal)
- 💼 **LinkedIn**: [Student Result Portal](https://linkedin.com/company/resultportal)

### Communication Guidelines

1. **Be respectful and professional**
2. **Search before asking** - Your question might already be answered
3. **Provide context** - Include relevant details
4. **Be patient** - Maintainers are volunteers
5. **Give back** - Help others when you can

## 🏆 Recognition

Contributors will be:

- Listed in our [README.md](README.md#-contributors)
- Featured in release notes for significant contributions
- Eligible for contributor swag (stickers, t-shirts)
- Invited to our contributor Discord channel

## 📄 License

By contributing, you agree that your contributions will be licensed under the ISC License.

---

## 🎯 Quick Reference

```bash
# Setup
git clone https://github.com/YOUR_USERNAME/Result-portal.git
cd Result-portal
git remote add upstream https://github.com/aryapatel23/Result-portal.git

# Create branch
git checkout -b feature/amazing-feature

# Make changes, then commit
git add .
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

**Thank you for contributing! Every contribution, no matter how small, makes a difference.** 🙏

---

<div align="center">

Made with ❤️ by the Student Result Portal Community

[Report Bug](https://github.com/aryapatel23/Result-portal/issues) · [Request Feature](https://github.com/aryapatel23/Result-portal/issues) · [Join Discord](https://discord.gg/resultportal)

</div>
