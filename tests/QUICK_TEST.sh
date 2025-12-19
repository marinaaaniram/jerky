#!/bin/bash

# QUICK_TEST.sh
# Быстрое выполнение всех основных тестов

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════╗"
echo "║     JERKY v2 - QUICK TEST SUITE           ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

TESTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS=()

# Test 1: Decimal Price Bug
echo -e "${BLUE}[1/2]${NC} Running: Decimal Price Bug Test..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if bash "$TESTS_DIR/bugs/decimal-price-bug.sh" > /tmp/test1.log 2>&1; then
  echo -e "${GREEN}✅ PASSED${NC} - Decimal prices are numbers"
  RESULTS+=("PASS")
else
  echo -e "${RED}❌ FAILED${NC} - Decimal price bug still exists"
  RESULTS+=("FAIL")
  tail -20 /tmp/test1.log
fi
echo ""

# Test 2: Order Management Feature
echo -e "${BLUE}[2/2]${NC} Running: Order Management Feature Test..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if bash "$TESTS_DIR/features/order-management.sh" > /tmp/test2.log 2>&1; then
  echo -e "${GREEN}✅ PASSED${NC} - Order management works correctly"
  RESULTS+=("PASS")
else
  echo -e "${RED}❌ FAILED${NC} - Order management has issues"
  RESULTS+=("FAIL")
  tail -20 /tmp/test2.log
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${CYAN}📊 TEST SUMMARY${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

PASSED=0
FAILED=0

for i in "${!RESULTS[@]}"; do
  test_num=$((i + 1))
  result="${RESULTS[$i]}"

  if [ "$result" = "PASS" ]; then
    echo -e "  Test $test_num: ${GREEN}✅ PASSED${NC}"
    ((PASSED++))
  else
    echo -e "  Test $test_num: ${RED}❌ FAILED${NC}"
    ((FAILED++))
  fi
done

echo ""
echo "Total: $((PASSED + FAILED)) | Passed: $PASSED | Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
  echo "Ready to commit! ✨"
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  echo "Check logs above and fix issues"
  exit 1
fi
