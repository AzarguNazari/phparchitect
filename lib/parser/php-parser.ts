import { Engine } from 'php-parser';

interface FunctionParam {
    name: string;
    type?: string;
}

interface FunctionInfo {
    name: string;
    modifier: string;
    params: FunctionParam[];
}

interface AttributeInfo {
    name: string;
    modifier: string;
    type?: string;
}

interface ClassInfo {
    name: string;
    attributes: AttributeInfo[];
    functions: FunctionInfo[];
    extends: string | null;
    implements: string[];
    isInterface: boolean;
}

export class PHPToUMLParser {
    private engine: Engine;

    constructor() {
        this.engine = new Engine({
            parser: {
                extractDoc: true,
                php7: true,
            },
            ast: {
                withPositions: true,
            },
        });
    }

    public parseFiles(contents: string[]): string {
        const classes: Map<string, ClassInfo> = new Map();

        for (const content of contents) {
            try {
                const ast = this.engine.parseCode(content, 'file.php');
                this.traverseAST(ast, classes);
            } catch (e) {
                console.error('Failed to parse PHP file:', e);
            }
        }

        return this.generateNomnoml(classes);
    }

    private traverseAST(node: any, classes: Map<string, ClassInfo>) {
        if (!node) return;

        if (Array.isArray(node)) {
            node.forEach((n) => this.traverseAST(n, classes));
            return;
        }

        if (node.kind === 'class' || node.kind === 'interface') {
            const name = node.name.name;
            const classInfo: ClassInfo = {
                name,
                attributes: [],
                functions: [],
                extends: node.extends ? node.extends.name : null,
                implements: node.implements ? node.implements.map((i: any) => i.name) : [],
                isInterface: node.kind === 'interface',
            };

            node.body.forEach((member: any) => {
                if (member.kind === 'propertystatement') {
                    member.properties.forEach((p: any) => {
                        classInfo.attributes.push({
                            name: p.name.name,
                            modifier: member.visibility || 'public',
                            type: p.type ? p.type.name : undefined,
                        });
                    });
                } else if (member.kind === 'method') {
                    classInfo.functions.push({
                        name: member.name.name,
                        modifier: member.visibility || 'public',
                        params: member.arguments.map((arg: any) => ({
                            name: arg.name.name,
                            type: arg.type ? arg.type.name : undefined,
                        })),
                    });
                }
            });

            classes.set(name, classInfo);
        }

        if (node.children) {
            this.traverseAST(node.children, classes);
        }
        if (node.body) {
            this.traverseAST(node.body, classes);
        }
    }

    private generateNomnoml(classes: Map<string, ClassInfo>): string {
        let output = '';

        classes.forEach((info) => {
            const typeLabel = info.isInterface ? '<abstract><' + info.name + '>' : info.name;
            output += `[${typeLabel}`;

            if (info.attributes.length > 0 || info.functions.length > 0) {
                output += '|';
                info.attributes.forEach((attr) => {
                    output += `${this.getModifierChar(attr.modifier)}${attr.name}${attr.type ? ': ' + attr.type : ''};`;
                });

                if (info.functions.length > 0) {
                    output += '|';
                    info.functions.forEach((func) => {
                        const params = func.params.map((p) => `${p.name}${p.type ? ': ' + p.type : ''}`).join(', ');
                        output += `${this.getModifierChar(func.modifier)}${func.name}(${params});`;
                    });
                }
            }
            output += ']\n';

            if (info.extends) {
                output += `[${info.name}] -:> [${info.extends}]\n`;
            }

            info.implements.forEach((impl) => {
                output += `[${info.name}] --:> [<abstract><${impl}>]\n`;
            });
        });

        return output;
    }

    private getModifierChar(modifier: string): string {
        switch (modifier) {
            case 'public':
                return '+';
            case 'private':
                return '-';
            case 'protected':
                return '#';
            default:
                return '+';
        }
    }
}
