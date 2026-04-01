"""
Prime Number Sequence Calculator

This module finds and displays the first 50 prime numbers greater than 50
with proper vertical spacing in the console output.

Requirements met:
- Manual prime-checking logic (no external math libraries)
- Pure Python using only Standard Library
- PEP-8 compliant with comprehensive comments
- 50-pixel vertical spacing simulation via newlines
"""


def is_prime(number: int) -> bool:
    """
    Check if a number is prime using trial division.

    Implements manual prime checking without external libraries.
    Optimized to check only odd divisors up to the square root.

    Args:
        number: The integer to check for primality.

    Returns:
        True if the number is prime, False otherwise.
    """
    # Handle edge cases
    if number < 2:
        return False
    if number == 2:
        return True
    if number % 2 == 0:
        return False

    # Check odd divisors up to the square root of the number
    # If n = a * b, then one of a or b must be <= sqrt(n)
    i = 3
    while i * i <= number:
        if number % i == 0:
            return False
        i += 2

    return True


def find_primes_greater_than(start: int, count: int) -> list:
    """
    Find the first 'count' prime numbers strictly greater than 'start'.

    Args:
        start: The lower bound (exclusive).
        count: The number of primes to find.

    Returns:
        A list containing the first 'count' primes greater than start.
    """
    primes = []
    candidate = start + 1

    while len(primes) < count:
        if is_prime(candidate):
            primes.append(candidate)
        candidate += 1

    return primes


def display_primes_with_spacing(primes: list, spacing_lines: int = 3) -> None:
    """
    Display prime numbers with vertical spacing between each number.

    Simulates 50-pixel vertical spacing using newlines.
    Assumption: 1 line ≈ 20px, so 50px ≈ 2.5 lines.
    Approximated as 3 newlines between each number.

    Args:
        primes: List of prime numbers to display.
        spacing_lines: Number of newline characters between each prime (default: 3).
    """
    for prime in primes:
        print(prime)
        # -1 because print() automatically adds one newline
        print("\n" * (spacing_lines - 1))


def main() -> None:
    """
    Main function to orchestrate the prime number calculation and display.

    Finds the first 50 primes greater than 50 and displays them with proper spacing.
    """
    print("=" * 60)
    print("PRIME NUMBER SEQUENCE CALCULATOR")
    print("=" * 60)
    print("\nCalculating the first 50 prime numbers greater than 50...\n")

    # Find the first 50 primes greater than 50
    primes = find_primes_greater_than(start=50, count=50)

    print("First 50 Prime Numbers > 50 (with 50px vertical spacing):")
    print("-" * 60)
    print()

    # Display with vertical spacing
    display_primes_with_spacing(primes, spacing_lines=3)

    # Print summary statistics
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total primes found: {len(primes)}")
    print(f"First prime (smallest): {primes[0]}")
    print(f"Last prime (largest): {primes[-1]}")
    print(f"Range: {primes[0]} to {primes[-1]}")
    print("=" * 60)


if __name__ == "__main__":
    main()
