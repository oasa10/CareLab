import test from "node:test";
import assert from "node:assert/strict";
import { explicitRisk } from "../assets/v3/safety.js";

// These fixtures verify only the deliberately narrow local signpost.
// They do not establish clinical sensitivity, parse all negation or detect every crisis.
for (const text of [
  "Quiero suicidarme",
  "Voy a matarme",
  "Pienso hacerme daño",
  "Voy a hacerle daño",
  "Voy a matarle",
  "Voy a matarla",
  "No puedo mantenerme a salvo",
  "No puedo mantenerle a salvo",
  "No puedo mantenerla a salvo",
])
  test(`explicit first-person wording: ${text}`, () =>
    assert.equal(explicitRisk(text), true));

for (const text of [
  "No quiero suicidarme",
  "No voy a matarme",
  "No pienso hacerme daño",
  "Nunca quiero suicidarme",
  "Nunca voy a matarme",
  "Nunca pienso hacerme daño",
  "Jamás quiero suicidarme",
  "Jamás voy a hacerle daño",
  "Jamás voy a matarle",
  "Yo no voy a matarla",
  "Ya no quiero hacerme daño",
  "NO QUIERO HACERME DAÑO",
  "No  quiero suicidarme",
  "Nunca\npienso matarme",
])
  test(`direct negation does not trigger: ${text}`, () =>
    assert.equal(explicitRisk(text), false));

test("common caregiving words, intense emotions and fictional topics are not enough", () => {
  for (const text of [
    "",
    null,
    undefined,
    "Estoy agotada",
    "Tengo mucha culpa",
    "Quiero descansar",
    "Hablamos de prevención del suicidio",
    "Necesito mantenerme a salvo",
    "Quiero matar el tiempo",
    "Tengo miedo de hacer daño sin querer",
    "La película trata de una persona que se suicida",
  ]) {
    assert.equal(explicitRisk(text), false, String(text));
  }
});

test("normalization handles accents and case without retaining regular-expression state", () => {
  for (let i = 0; i < 3; i++)
    assert.equal(explicitRisk("PIENSO HACERME DAÑO"), true);
  assert.equal(explicitRisk("NO PIENSO HACERME DAÑO"), false);
  assert.equal(explicitRisk("Pienso hacerme dan\u0303o"), true);
});

test("one negated statement does not hide a separate explicit statement", () => {
  assert.equal(
    explicitRisk("No quiero matarme. Pero voy a hacerle daño."),
    true,
  );
  assert.equal(
    explicitRisk("No quiero matarme. Nunca voy a hacerle daño."),
    false,
  );
  assert.equal(explicitRisk("No tengo un relevo. Quiero hacerme daño."), true);
});
