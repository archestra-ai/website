async function main() {
  // TODO:
  console.log('Hello, world!');
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}
