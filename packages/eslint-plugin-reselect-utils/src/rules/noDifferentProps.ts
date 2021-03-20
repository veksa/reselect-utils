import {
  AST_NODE_TYPES,
  ESLintUtils,
} from '@typescript-eslint/experimental-utils';
import { ruleCreator } from '../utils/ruleCreator';
import { getCachedSelectorCreatorOptions } from '../utils/getCachedSelectorCreatorOptions';
import { getKeySelector } from '../utils/getKeySelectorFromOptions';
import { getKeySelectorProps } from '../utils/getKeySelectorProps';
import { getSelectorCreatorReturnType } from '../utils/getSelectorCreatorReturnType';
import { getCachedSelectorProps } from '../utils/getCachedSelectorProps';
import { areParametersDifferent } from '../utils/areParametersDifferent';
import { getPropSelectorString } from '../utils/getPropSelectorString';
import { getKeySelectorProperty } from '../utils/getKeySelectorProperty';
import { isCachedSelectorCreator } from '../utils/isCachedSelectorCreator';
import { getParametersFromProps } from '../utils/getParametersFromProps';
import { getImportFix } from '../utils/getImportFix';

export enum Errors {
  DifferentProps = 'DifferentProps',
}

export const noDifferentPropsRule = ruleCreator({
  name: 'no-different-props',
  defaultOptions: [],
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Cached selector and key selector must have same props.',
      recommended: 'error',
    },
    fixable: 'code',
    messages: {
      [Errors.DifferentProps]:
        'Cached selector and key selector must have same props. selector parameters = {{selectorParameters}}, key selector parameters = {{keySelectorParameters}}',
    },
    schema: [],
    type: 'problem',
  },
  create: (context) => {
    const { esTreeNodeToTSNodeMap, program } = ESLintUtils.getParserServices(
      context,
    );
    const typeChecker = program.getTypeChecker();

    return {
      CallExpression(callExpression) {
        const tsNode = esTreeNodeToTSNodeMap.get(callExpression);

        if (isCachedSelectorCreator(tsNode.expression)) {
          const expressionName = tsNode.expression.expression.getText();

          const options = getCachedSelectorCreatorOptions(tsNode, typeChecker);
          const keySelector = getKeySelector(options);

          const selectorCreatorReturnType = getSelectorCreatorReturnType(
            expressionName === 'createCachedSelector'
              ? tsNode.expression
              : tsNode,
            typeChecker,
          );

          if (keySelector && selectorCreatorReturnType) {
            const keySelectorProps = getKeySelectorProps(
              keySelector,
              typeChecker,
            );

            const cachedSelectorProps = getCachedSelectorProps(
              selectorCreatorReturnType,
              typeChecker,
            );

            const selectorParameters = getParametersFromProps(
              cachedSelectorProps,
              typeChecker,
            );
            const keySelectorParameters = getParametersFromProps(
              keySelectorProps,
              typeChecker,
            );

            if (
              areParametersDifferent(selectorParameters, keySelectorParameters)
            ) {
              const selectorParametersString = selectorParameters
                .map((prop) => ` ${prop.name}: ${prop.typeString} `)
                .join(';');

              const keySelectorParametersString = keySelectorParameters
                .map((prop) => ` ${prop.name}: ${prop.typeString} `)
                .join(';');

              context.report({
                messageId: Errors.DifferentProps,
                node: callExpression.arguments[0],
                data: {
                  selectorParameters: `{${selectorParametersString}}`,
                  keySelectorParameters: `{${keySelectorParametersString}}`,
                },
                fix(fixer) {
                  const propSelectors = cachedSelectorProps.map((prop) =>
                    getPropSelectorString(prop, typeChecker),
                  );

                  const isComposedSelector = propSelectors.length > 1;
                  const isDefaultKeySelector = propSelectors.length === 0;
                  const composedPropSelector = isComposedSelector
                    ? `composeKeySelectors(\n${propSelectors.join(', \n')}\n)`
                    : propSelectors[0] ?? 'defaultKeySelector';
                  const resultKeySelector = `keySelector: ${composedPropSelector}`;
                  const argument = callExpression.arguments[0];

                  if (argument.type === AST_NODE_TYPES.ObjectExpression) {
                    const keySelectorProperty = getKeySelectorProperty(
                      argument,
                    );
                    const selectorFix = keySelectorProperty
                      ? fixer.replaceText(
                          keySelectorProperty,
                          resultKeySelector,
                        )
                      : // keySelector is added via spread operator we cant modify that object so insert as last property
                        fixer.insertTextBeforeRange(
                          [argument.range[1] - 1, argument.range[1] - 1],
                          argument.properties.length === 0
                            ? `${resultKeySelector}`
                            : `, ${resultKeySelector}`,
                        );

                    const specifierNames = ['prop'];
                    if (isComposedSelector) {
                      specifierNames.push('composeKeySelectors');
                    }
                    if (isDefaultKeySelector) {
                      specifierNames.push('defaultKeySelector');
                    }

                    const importFix = getImportFix(
                      fixer,
                      callExpression,
                      'reselect-utils',
                      specifierNames,
                    );

                    return [selectorFix, importFix];
                  }

                  return null;
                },
              });
            }
          }
        }
      },
    };
  },
});
